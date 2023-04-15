import invariant from "invariant";
import { trpcServer } from "./server";

export const combineMetaMiddleware = trpcServer.middleware(({ meta, ctx, next }) => {
	if (!ctx.combinedMeta) {
		return next({
			ctx: {
				combinedMeta: meta,
			},
		});
	}

	invariant(false, "meta already set, batching not supported");
});
