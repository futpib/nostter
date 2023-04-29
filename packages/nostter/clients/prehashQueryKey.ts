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
	'id',
	'kinds',
	'author',
	'authors',
	'relays',
]);

export function queryKeyHashFn(prehashedQueryKey: PrehashedQueryKey): string {
	if (prehashedQueryKey.length === 1) {
		const [ json ] = prehashedQueryKey;

		return json;
	}

	const trpcQueryKey = prehashedQueryKey as unknown as [ string[], PartialDeep<{
		input: {
			id: string;
			kinds: string[];
			author: string;
			authors: string[];
			relays: string[];
		};
		type: string,
	}> ];

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
		].join(';'),
	].join('\n');
}
