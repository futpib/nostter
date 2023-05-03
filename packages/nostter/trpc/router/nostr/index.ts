import { z } from 'zod';
import { trpcServer } from "@/trpc/server";
import { EVENT_KIND_REACTION, EVENT_KIND_SHORT_TEXT_NOTE } from '@/constants/eventKinds';
import { EventSet } from '@/nostr/EventSet';
import { maxCacheTime } from '@/utils/setCacheControlHeader';
import { combineMetaMiddleware, combineRelaysMiddleware, ensureRelaysMiddleware } from '@/trpc/middlewares';
import { observable } from '@trpc/server/observable';
import { Event } from 'nostr-tools';
import invariant from 'invariant';

const commonInputSchema = z.object({
	cacheKeyNonce: z.string().optional(),
});

const eventPointerSchema = z.object({
	id: z.string(),
	relays: z.array(z.string()).optional(),
	author: z.string().optional(),
});

const cursorSchema = z.object({
	since: z.number().optional(),
	until: z.number().optional(),
	limit: z.number().optional(),
});

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
				kinds: [ EVENT_KIND_SHORT_TEXT_NOTE ],
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

	infiniteEvents: trpcServer.procedure
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
		.input(z.intersection(commonInputSchema, z.object({
			kinds: z.array(z.number()).optional(),
			authors: z.array(z.string()).optional(),
			cursor: cursorSchema.optional(),
		})))
		.query(async ({ input: { kinds, authors, cursor }, ctx }) => {
			const cursorDuration = (
				cursor?.since && cursor?.until
					? cursor.until - cursor.since
					: undefined
			);

			const filter = {
				kinds,
				authors,
				since: cursor?.since,
				until: cursor?.until,
				limit: cursor?.limit,
			};

			const events = await ctx.relayPool.list(ctx.combinedRelays, [ filter ]);

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

	eventReactionEventsSubscription: trpcServer.procedure
		.use(combineRelaysMiddleware)
		.input(z.intersection(commonInputSchema, eventPointerSchema))
		.subscription(({ input: { id }, ctx }) => {
			return observable<Event>(observer => {
				const subscribtion = ctx.relayPool.sub(ctx.combinedRelays, [ {
					kinds: [ EVENT_KIND_REACTION ],
					['#e']: [ id ],
				} ]);

				subscribtion.on('event', event => {
					observer.next(event);
				});

				return () => {
					subscribtion.unsub();
				};
			});
		}),
});
