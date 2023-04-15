import { z } from 'zod';
import { trpcServer } from "@/trpc/server";
import { EVENT_KIND_SHORT_TEXT_NOTE } from '@/constants/eventKinds';
import { EventSet } from '@/nostr/EventSet';
import { maxCacheTime } from '@/utils/setCacheControlHeader';
import { combineMetaMiddleware } from '@/trpc/middlewares';

export const trpcNostrRouter = trpcServer.router({
	event: trpcServer.procedure
		.use(combineMetaMiddleware)
		.meta({
			cacheControl: {
				nonEmpty: {
					public: true,
					immutable: true,
					maxAge: maxCacheTime,
				},
			},
		})
		.input(
			z.object({
				id: z.string(),
				relays: z.array(z.string()).optional(),
				author: z.string().optional(),
			}),
		)
		.query(async ({ input: { id, relays = [], author }, ctx }) => {
			const allRelays = ctx.defaultRelays.concat(relays);

			const filter = {
				kinds: [ EVENT_KIND_SHORT_TEXT_NOTE ],
				ids: [ id ],
				authors: author ? [ author ] : undefined,
			};

			const event = await ctx.relayPool.get(allRelays, filter);

			const eventSet = new EventSet();

			if (event) {
				eventSet.add(event);
			}

			return eventSet;
		}),
});
