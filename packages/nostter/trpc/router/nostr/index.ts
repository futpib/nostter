import { z, ZodType } from 'zod';
import { trpcServer } from "@/trpc/server";
import { EventSet } from '@/nostr/EventSet';
import { maxCacheTime } from '@/utils/setCacheControlHeader';
import { combineMetaMiddleware, combineRelaysMiddleware, ensureRelaysMiddleware, resolveAuthorsPublicKeySetHash } from '@/trpc/middlewares';
import { observable } from '@trpc/server/observable';
import { Event, Filter } from 'nostr-tools';
import invariant from 'invariant';
import { EventKind } from '@/nostr/EventKind';

const commonInputSchema = z.object({
	cacheKeyNonce: z.string().optional(),
});

function zSorted<T extends string | number>(zArray: ZodType<T[]>) {
	return zArray.refine(array => {
		const sorted = [ ...array ].sort();

		return sorted.every((value, index) => value === array[index]);
	}, {
		message: 'must be sorted',
	});
}

function zUnique<T extends string | number>(zArray: ZodType<T[]>) {
	return zArray.refine(array => {
		const set_ = new Set(array);

		return set_.size === array.length;
	}, {
		message: 'must be unique',
	});
}

function zArrayUniqueSorted<T extends string | number>(zType: ZodType<T>) {
	return zUnique(zSorted(z.array(zType)));
}

const eventPointerSchema = z.object({
	id: z.string(),
	relays: zArrayUniqueSorted(z.string()).optional(),
	author: z.string().optional(),
});

const cursorSchema = z.object({
	since: z.number().optional(),
	until: z.number().optional(),
	limit: z.number().optional(),
});

function zNotStartsWith(zString: ZodType<string>, prefix: string) {
	return zString.refine(value => !value.startsWith(prefix), {
		message: 'must not start with ' + prefix,
	});
}

const eventsInputSchema = z.object({
	kinds:  zArrayUniqueSorted(z.number()).optional(),
	authors: zArrayUniqueSorted(z.string()).optional(),

	referencedEventIds: zArrayUniqueSorted(z.string()).optional(),
	referencedHashtags: zArrayUniqueSorted(
		zNotStartsWith(z.string(), '#')
	).optional(),

	cursor: cursorSchema.optional(),
});

export type EventsInput = z.infer<typeof eventsInputSchema>;

export type Cursor = z.infer<typeof cursorSchema>;

function cursorEquals(a: Cursor, b: Cursor) {
	return (
		a.since === b.since &&
			a.until === b.until &&
			a.limit === b.limit
	);
}

function compareEventsLatestFirst(a: Event, b: Event) {
	return b.created_at - a.created_at;
}

export const trpcNostrRouter = trpcServer.router({
	event: trpcServer.procedure
		.use(combineMetaMiddleware({
			meta: {
				cacheControl: {
					nonEmpty: {
						public: true,
						immutable: true,
						maxAge: maxCacheTime,
					},
				},
			},
		}))
		.use(combineRelaysMiddleware)
		.use(ensureRelaysMiddleware)
		.input(z.intersection(commonInputSchema, eventPointerSchema))
		.query(async ({ input: { id, author }, ctx }) => {
			const filter = {
				kinds: [ EventKind.Text, EventKind.FileMetadata ],
				ids: [ id ],
				authors: author ? [ author ] : undefined,
			};

			const event = await ctx.relayPool.get(ctx.combinedRelays, filter);

			const eventSet = new EventSet();

			if (event) {
				eventSet.add(event);
			}

			return eventSet;
		}),

	eventsInfinite: trpcServer.procedure
		.use(combineMetaMiddleware({
			meta: {
				cacheControl: {
					public: true,
					immutable: true,
					maxAge: maxCacheTime,
				},
			},
		}))
		.use(combineRelaysMiddleware)
		.use(ensureRelaysMiddleware)
		.use(resolveAuthorsPublicKeySetHash)
		.input(z.intersection(commonInputSchema, eventsInputSchema))
		.query(async ({
			input: {
				kinds,

				referencedEventIds,
				referencedHashtags,

				cursor,
			},
			ctx: {
				combinedRelays,

				resolvedAuthors: authors,

				relayPool,
			},
		}) => {
			const cursorDuration = (
				cursor?.since && cursor?.until
					? cursor.until - cursor.since
					: undefined
			);

			const filter: Filter = {
				kinds,
				authors,
				since: cursor?.since,
				until: cursor?.until,
				limit: cursor?.limit,
			};

			if (referencedEventIds?.length) {
				filter['#e'] = referencedEventIds;
			}

			if (referencedHashtags?.length) {
				filter['#t'] = referencedHashtags;
			}

			const events = await relayPool.list(combinedRelays, [ filter ]);

			const eventSet = new EventSet();

			for (const event of events.sort(compareEventsLatestFirst)) {
				if (filter.since && event.created_at < filter.since) {
					continue;
				}

				if (filter.until && event.created_at > filter.until) {
					continue;
				}

				if (filter.limit && eventSet.size >= filter.limit) {
					break;
				}

				eventSet.add(event);
			}

			const oldestEvent = eventSet.getOldestEvent();

			const nextCursorUntil = (
				cursor?.limit
					? (
						oldestEvent
							? oldestEvent.created_at
							: cursor.until
					)
					: (
						cursorDuration
							? cursor!.until! - Math.round(cursorDuration / 2)
							: undefined
					)
			);

			const nextCursor: Cursor = {
				until: nextCursorUntil,
				since: (
					cursorDuration
						? (
							nextCursorUntil
								? nextCursorUntil - cursorDuration
								: invariant(false, 'nextCursorUntil is undefined when cursorDuration is defined')
						)
						: undefined
				),
				limit: cursor?.limit,
			};

			return {
				eventSet,
				nextCursor : (
					(cursor && cursorEquals(cursor, nextCursor))
						? undefined
						: nextCursor
				),
			};
		}),

	eventsSubscription: trpcServer.procedure
		.use(combineRelaysMiddleware)
		.use(resolveAuthorsPublicKeySetHash)
		.input(z.intersection(commonInputSchema, eventsInputSchema))
		.subscription(({
			input: {
				kinds,

				referencedEventIds,
				referencedHashtags,

				cursor,
			},
			ctx: {
				combinedRelays,

				resolvedAuthors: authors,

				relayPool,
			},
		}) => {
			return observable<Event>(observer => {
				const filter: Filter = {
					kinds,
					authors,
					since: cursor?.since,
					until: cursor?.until,
					limit: cursor?.limit,
				};

				if (referencedEventIds?.length) {
					filter['#e'] = referencedEventIds;
				}

				if (referencedHashtags?.length) {
					filter['#t'] = referencedHashtags;
				}

				const subscribtion = relayPool.sub(combinedRelays, [ filter ]);

				subscribtion.on('event', (event: Event) => {
					if (filter.since && event.created_at < filter.since) {
						return;
					}

					if (filter.until && event.created_at > filter.until) {
						return;
					}

					observer.next(event);
				});

				return () => {
					subscribtion.unsub();
				};
			});
		}),
});
