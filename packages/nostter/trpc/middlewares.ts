import { LocalPool } from "@/nostr/LocalPool";
import { debugExtend } from "@/utils/debugExtend";
import invariant from "invariant";
import { TRPCMeta } from "./meta";
import { trpcServer } from "./server";

const log = debugExtend('middlewares');

export const combineRelaysMiddleware = trpcServer.middleware(({ input, rawInput, ctx, next }) => {
	const someInput = (input ?? rawInput) as { relays?: string[] } | undefined;
	const inputRelays = someInput?.relays ?? [];

	const combinedRelays = [...(new Set([...ctx.defaultRelays, ...(inputRelays ?? [])]))].sort();

	return next({
		ctx: {
			...ctx,
			combinedRelays,
		},
	});
});

export const ensureRelaysMiddleware = trpcServer.middleware(async ({ ctx, next }) => {
	if (ctx.relayPool instanceof LocalPool) {
		return next();
	}

	invariant(new Set(ctx.combinedRelays).size === ctx.combinedRelays.length, "Duplicate relays");

	log('Ensuring relays');

	await Promise.all(ctx.combinedRelays.map(async relay => {
		try {
			await ctx.relayPool.ensureRelay(relay);
			log('Ensured relay', relay);
		} catch (error) {
			console.warn('Error ensuring relay', relay, error);
		}
	}));

	log('Relays ensured');

	return next();
});

export const combineMetaMiddleware = ({ meta: meta_ }: { meta: TRPCMeta }) => {
	return trpcServer.middleware(({ meta, ctx, next }) => {
		invariant(!ctx.combinedMeta, "meta already set");

		ctx.combinedMeta = meta ?? meta_;

		return next();
	});
};
