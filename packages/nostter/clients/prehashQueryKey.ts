import invariant from "invariant";
import { PartialDeep } from "type-fest";
import { Cursor } from "@/trpc/router/nostr";

const knownOptions = new Set([
	'cacheKeyNonce',

	'id',
	'kinds',
	'author',
	'authors',
	'relays',
	'referencedEventIds',
	'referencedHashtags',

	'cursor',

	'url',
]);

export type TRPCQueryKey = readonly [ string[], PartialDeep<{
	input: {
		cacheKeyNonce: string;

		id: string;
		kinds: number[];
		author: string;
		authors: string[];
		relays: string[];
		referencedEventIds: string[];
		referencedHashtags: string[];

		cursor: Cursor;

		url: string;
	};
	type: string,
}> ];

export function trpcQueryKeyHashFn(
	trpcQueryKey: TRPCQueryKey
) {
	const trpcQueryKeyOptions = trpcQueryKey[1];

	for (const key of Object.keys(trpcQueryKeyOptions.input ?? {})) {
		invariant(knownOptions.has(key), 'Uknown trpc query option %s', key);
	}

	return [
		[
			trpcQueryKeyOptions.type,
			trpcQueryKey[0].join('.'),
		].join(' '),
		[
			trpcQueryKeyOptions.input?.id,
			trpcQueryKeyOptions.input?.kinds?.join(),
			trpcQueryKeyOptions.input?.author,
			trpcQueryKeyOptions.input?.authors?.join(),
			trpcQueryKeyOptions.input?.relays?.join(),
			trpcQueryKeyOptions.input?.referencedEventIds?.slice().sort().join(),
			trpcQueryKeyOptions.input?.referencedHashtags?.slice().sort().join(),

			[
				trpcQueryKeyOptions.input?.cursor?.since,
				trpcQueryKeyOptions.input?.cursor?.until,
				trpcQueryKeyOptions.input?.cursor?.limit,
			].join(),

			trpcQueryKeyOptions.input?.url,
		].join(';'),
		trpcQueryKeyOptions.input?.cacheKeyNonce ?? '',
	].join('\n');
}

export function queryKeyHashFn(prehashedQueryKey: TRPCQueryKey): string {
	return trpcQueryKeyHashFn(prehashedQueryKey);
}
