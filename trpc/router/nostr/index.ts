import { z } from 'zod';
import { trpcServer } from "@/trpc/server";
import { EVENT_KIND_REACTION, EVENT_KIND_SHORT_TEXT_NOTE } from '@/constants/eventKinds';
import { EventSet } from '@/nostr/EventSet';
import { maxCacheTime } from '@/utils/setCacheControlHeader';
import { combineMetaMiddleware, combineRelaysMiddleware } from '@/trpc/middlewares';
import { observable } from '@trpc/server/observable';
import { Event } from 'nostr-tools';

const eventPointerSchema = z.object({
	id: z.string(),
	relays: z.array(z.string()).optional(),
	author: z.string().optional(),
});

export const trpcNostrRouter = trpcServer.router({
	event: trpcServer.procedure
		.use(combineMetaMiddleware)
		.use(combineRelaysMiddleware)
		.meta({
			cacheControl: {
				nonEmpty: {
					public: true,
					immutable: true,
					maxAge: maxCacheTime,
				},
			},
		})
		.input(eventPointerSchema)
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

	eventReactionEventsSubscription: trpcServer.procedure
		.use(combineRelaysMiddleware)
		.input(eventPointerSchema)
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
