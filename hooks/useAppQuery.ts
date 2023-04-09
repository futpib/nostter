import invariant from "invariant";
import { UseQueryOptions, UseQueryResult, useQueries, QueriesOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import { usePreferences } from "./usePreferences";
import { EventSet } from "@/nostr/EventSet";
import { handleSuccess } from "@/clients/handleSuccess";
import { prehashQueryKey } from "@/clients/prehashQueryKey";
import { getStaleTime } from "@/clients/staleTime";

type UseAppQueryResult<TData, TError> = Pick<UseQueryResult<TData, TError>, 'data' | 'isLoading'>;

export type QueryKeyParameters = {
	relays: string[];
};

export type ShortQueryKeyParameters = undefined | {
	relays?: string[];
};

export type QueryKeyResource =
	| readonly [
		resource: 'event',
		id: undefined | string,
		...rest:
			| []
			| [ subresource: 'descendants' | 'reposts' | 'reactions' ]
		,
	]
	| readonly [
		resource: 'pubkey',
		pubkey: undefined | string,
		...rest:
			| [ subresource: 'metadata' ]
	]
;

type ShortQueryKey = readonly [
	backend: 'auto' | 'api' | 'pool' | 'local',
	network: 'nostr',
	parameters: ShortQueryKeyParameters,
	...resource: QueryKeyResource,
];

export type QueryKeyPreferences = {
	relays: string[],
};

export type FullQueryKey = readonly [
	preferences: QueryKeyPreferences,
	backend: 'auto' | 'api' | 'pool' | 'local',
	network: 'nostr',
	parameters: QueryKeyParameters,
	...resource: QueryKeyResource,
]

const backends = {
	'api': {},
	'pool': {},
	'local': {},
};

function expandQueryKey(queryKey: FullQueryKey): FullQueryKey[] {
	const [ preferences, backend, ...rest ] = queryKey;

	if (typeof backend === 'string' && backend === 'auto') {
		return Object.keys(backends).map(backend => [ preferences, backend as any, ...rest ]);
	}

	if (typeof backend === 'string' && backend in backends) {
		return [ queryKey ];
	}

	invariant(false, `Invalid backend: ${backend}`);
}

function useMergeAppQueryResults<TError>(
	queryResults: UseQueryResult<EventSet, TError>[],
): UseAppQueryResult<EventSet, TError> {
	const isLoading = useMemo(() => {
		const everyDone = queryResults.every(queryResult => !queryResult.isLoading);
		const someDoneAndNonEmpty = queryResults.some(queryResult => (
			(
				queryResult.data
					&& queryResult.data.size > 0
			) && !queryResult.isLoading
		));

		return !(everyDone || someDoneAndNonEmpty);
	}, [ queryResults ]);

	const data = useMemo(() => {
		const data = new EventSet();

		for (const queryResult of queryResults) {
			if (!queryResult.data) {
				continue;
			}

			for (const event of queryResult.data) {
				data.add(event);
			}
		}

		return data;
	}, [
		queryResults,
	]);

	return useMemo(() => ({
		data,
		isLoading,
	}), [
		data,
		isLoading,
	]);
}

function useQueryPreferences() {
	const preferences = usePreferences();

	return useMemo(() => {
		const relays = Object.entries(preferences.relays)
			.filter(([ _relay, { enabled } ]) => enabled)
			.map(([ relay ]) => relay)
			.sort();

		return {
			relays,
		};
	}, [ preferences ]);
}

function shortQueryKeyToFullQueryKey(shortQueryKey: ShortQueryKey, queryPreferences: QueryKeyPreferences): FullQueryKey {
	const [ backend, network, shortParameters, ...resource ] = shortQueryKey;

	const parameters = {
		...shortParameters,
		relays: shortParameters?.relays?.sort() ?? [],
	};

	return [ queryPreferences, backend, network, parameters, ...resource ];
}

function useFullQueryKey(shortQueryKey: ShortQueryKey): FullQueryKey {
	const queryPreferences = useQueryPreferences();

	return useMemo(() => {
		return shortQueryKeyToFullQueryKey(shortQueryKey, queryPreferences);
	}, [ queryPreferences, shortQueryKey ]);
}

type UseAppQueryError = unknown;

export type UseAppQueryOptions = Omit<UseQueryOptions<EventSet, UseAppQueryError, EventSet, ShortQueryKey>, 'queryKey' | 'queryFn'>;

export function useAppQuery(
	shortQueryKey: ShortQueryKey,
	options?: UseAppQueryOptions,
): UseAppQueryResult<EventSet, UseAppQueryError> {
	const fullQueryKey = useFullQueryKey(shortQueryKey);

	const queryKeys = useMemo(() => expandQueryKey(fullQueryKey), [ fullQueryKey ]);

	const queryResults = useQueries({
		queries: queryKeys.map((fullQueryKey): UseAppQueryOptions & { queryKey: any } => ({
			...options,
			queryKey: prehashQueryKey(fullQueryKey),
			staleTime: getStaleTime(fullQueryKey),
			onSuccess(eventSet) {
				handleSuccess(eventSet);
				return options?.onSuccess?.(eventSet);
			},
		})),
	});

	return useMergeAppQueryResults(queryResults)
}

export function useAppQueries<
	T extends any[],
	TError = unknown,
>(
	{ queries }: {
		queries: readonly [...QueriesOptions<T>];
	},
): UseAppQueryResult<EventSet, TError> {
	const queryPreferences = useQueryPreferences();

	const expandedQueries = useMemo(() => {
		return queries.flatMap((query) => {
			const fullQueryKey = shortQueryKeyToFullQueryKey(query.queryKey, queryPreferences);
			const fullQueryKeys = expandQueryKey(fullQueryKey);

			return fullQueryKeys.map((fullQueryKey): UseAppQueryOptions => ({
				...query,
				queryKey: prehashQueryKey(fullQueryKey),
				staleTime: getStaleTime(fullQueryKey),
				onSuccess(eventSet) {
					handleSuccess(eventSet);
					return query.onSuccess?.(eventSet);
				},
			}));
		});
	}, [ queryPreferences, queries ]);

	const queryResults = useQueries({
		queries: expandedQueries,
	});

	return useMergeAppQueryResults(queryResults as unknown as UseQueryResult<EventSet, TError>[]);
}
