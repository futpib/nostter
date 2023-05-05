import { FullQueryKey, QueryKeyParameters, QueryKeyPreferences, QueryKeyResource } from "@/hooks/useAppQuery";
import invariant from "invariant";
import { PartialDeep } from "type-fest";

export type PrehashedQueryKey = readonly [ json: string ];

export type PrehashedQueryKeyInner = readonly [
	preferencesHash: string,
	mode: 'finite' | 'infinite',
	backend: 'auto' | 'api' | 'pool' | 'local',
	network: 'nostr',
	parametersHash: string,
	...resource: QueryKeyResource,
];

const unprehashPreferencesMap = new Map<string, QueryKeyPreferences>();
const unprehashParametersMap = new Map<string, QueryKeyParameters>();

export function prehashQueryKey(queryKey: FullQueryKey): PrehashedQueryKey {
	const [preferences, mode, backend, network, parameters, ...resource] = queryKey;

	// TODO
	const preferencesHash = preferences.relays.length.toString();
	unprehashPreferencesMap.set(preferencesHash, preferences);

	// TODO
	const parametersHash = parameters.relays.length.toString();
	unprehashParametersMap.set(parametersHash, parameters);

	const json = JSON.stringify([preferencesHash, mode, backend, network, parametersHash, ...resource]);

	return [ json ];
}

export function unprehashQueryKey(prehashedQueryKey: PrehashedQueryKey): FullQueryKey {
	const [ json ] = prehashedQueryKey;

	const prehashedQueryKeyInner = JSON.parse(json) as PrehashedQueryKeyInner;

	const [preferencesHash, mode, backend, network, parametersHash, ...resource] = prehashedQueryKeyInner;

	const preferences = unprehashPreferencesMap.get(preferencesHash);

	invariant(preferences, 'Preferences hash %s not found', preferencesHash);

	const parameters = unprehashParametersMap.get(parametersHash);

	invariant(parameters, 'Parameters hash %s not found', parametersHash);

	return [preferences, mode, backend, network, parameters, ...resource];
}

const knownOptions = new Set([
	'cacheKeyNonce',

	'id',
	'kinds',
	'author',
	'authors',
	'relays',

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

			trpcQueryKeyOptions.input?.url,
		].join(';'),
		trpcQueryKeyOptions.input?.cacheKeyNonce ?? '',
	].join('\n');
}

export function queryKeyHashFn(prehashedQueryKey: PrehashedQueryKey): string {
	if (prehashedQueryKey.length === 1) {
		const [ json ] = prehashedQueryKey;

		return json;
	}

	return trpcQueryKeyHashFn(prehashedQueryKey as any);
}
