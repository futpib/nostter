import { EventSet } from '@/nostr/EventSet';
import { createTRPCContext } from '@/trpc/context';
import { TRPCMetaCacheControl } from '@/trpc/meta';
import { trpcRouter } from '@/trpc/router';
import { getCacheControlHeader } from '@/utils/setCacheControlHeader';
import * as trpcNext from '@trpc/server/adapters/next';
import invariant from 'invariant';

export default trpcNext.createNextApiHandler({
	router: trpcRouter,
	createContext: createTRPCContext,

	responseMeta({ type, ctx, data: datas }) {
		if (type !== 'query') {
			return {};
		}

		invariant(datas.length === 1, 'batching not supported');

		const [ data ] = datas;

		if (ctx?.combinedMeta?.cacheControl) {
			let cacheControl: string | undefined;

			invariant(
				(data as any)?.result?.data instanceof EventSet,
				'cacheControl only supported for EventSet',
			);

			const eventSet = (data as any).result.data as EventSet;

			if ('empty' in ctx.combinedMeta.cacheControl || 'nonEmpty' in ctx.combinedMeta.cacheControl) {
				const { empty, nonEmpty } = ctx.combinedMeta.cacheControl;

				if (eventSet.size === 0) {
					cacheControl = getCacheControlHeader(empty ?? {});
				} else {
					cacheControl = getCacheControlHeader(nonEmpty ?? {});
				}
			} else {
				cacheControl = getCacheControlHeader((ctx.combinedMeta.cacheControl as TRPCMetaCacheControl) ?? {});
			}

			if (cacheControl) {
				return {
					headers: {
						'Cache-Control': cacheControl,
					},
				};
			}
		}

		return {};
	},
});
