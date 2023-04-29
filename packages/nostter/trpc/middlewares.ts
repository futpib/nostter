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

export const ensureRelaysMiddleware = trpcServer.middleware(async ({ ctx, next }) => {
	await Promise.all(ctx.combinedRelays.map(async relay => {
		try {
			await ctx.relayPool.ensureRelay(relay);
		} catch (error) {
			console.warn('Error ensuring relay', relay, error);
		}
	}));

	return next();
});

export const combineMetaMiddleware = trpcServer.middleware(({ meta, ctx, next }) => {
	invariant(!ctx.combinedMeta, "meta already set");

	return next({
		ctx: {
			combinedMeta: meta,
		},
	});
});
