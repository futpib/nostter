import invariant from "invariant";
import { trpcServer } from "./server";

export const combineRelaysMiddleware = trpcServer.middleware(({ input, rawInput, ctx, next }) => {
	const someInput = (input ?? rawInput) as { relays?: string[] } | undefined;
	const inputRelays = someInput?.relays ?? [];

	const combinedRelays = [...(new Set([...ctx.defaultRelays, ...(inputRelays ?? [])]))].sort();

	return next({
		ctx: {
			combinedRelays,
		},
	});
});

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
