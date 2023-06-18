import { LocalPool } from "@/nostr/LocalPool";
import { debugExtend } from "@/utils/debugExtend";
import { getPublicRuntimeConfig } from "@/utils/getPublicRuntimeConfig";
import invariant from "invariant";
import { TRPCMeta } from "./meta";
import { trpcServer } from "./server";
import pMemoize from 'p-memoize';
import QuickLRU from 'quick-lru';

const log = debugExtend('middlewares');

const { publicUrl } = getPublicRuntimeConfig();

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
		// invariant(!ctx.combinedMeta, "meta already set");

		// HACK: `next` does not seem to be overriding the `ctx`
		ctx.combinedMeta = meta ?? meta_;

		return next();
	});
};

const getPublicKeySet = pMemoize(async (publicKeySetHash: string): Promise<string[]> => {
	const response = await fetch(publicUrl + '/api/public-key-set/' + publicKeySetHash);

	if (!response.ok) {
		throw new Error('Error fetching public key set');
	}

	const { publicKeys } = await response.json();

	return publicKeys;
}, {
	cacheKey: ([ hash ]) => hash,
	cache: new QuickLRU({
		maxSize: 16,
	}),
});

export const resolveAuthorsPublicKeySetHash = trpcServer.middleware(async ({ input, rawInput, ctx, next }) => {
	const someInput = (input ?? rawInput) as {
		authorsPublicKeySetHash?: undefined | string;
		authors?: undefined | string[];
	} | undefined;

	if (someInput?.authorsPublicKeySetHash) {
		invariant(!ctx.resolvedAuthors, "resolvedAuthors already set");

		const publicKeys = await getPublicKeySet(someInput.authorsPublicKeySetHash);

		ctx.resolvedAuthors = publicKeys;
	} else {
		ctx.resolvedAuthors = someInput?.authors ?? undefined;
	}

	return next();
});
