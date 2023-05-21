import invariant from "invariant";
import { UseQueryOptions, UseQueryResult, useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { usePreferences } from "./usePreferences";
import { EventSet } from "@/nostr/EventSet";
import { handleSuccess } from "@/clients/handleSuccess";
import { prehashQueryKey } from "@/clients/prehashQueryKey";
import { getStaleTime } from "@/clients/staleTime";
import { backends } from "@/clients/queryFn";

export type QueryKeyParameters = {
	relays: string[];
};

export type ShortQueryKeyParameters = undefined | {
	relays?: string[];
};

export type QueryKeyResource =
	| readonly [
		resource: 'event',
		...rest:
			| readonly [
				id: undefined | string,
				...rest:
					| [ subresource: 'descendants' | 'reposts' ]
				,
			]
		,
	]
;

type ShortQueryKey = readonly [
	mode: 'finite' | 'infinite',
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
	mode: 'finite' | 'infinite',
	backend: 'auto' | 'api' | 'pool' | 'local',
	network: 'nostr',
	parameters: QueryKeyParameters,
	...resource: QueryKeyResource,
]

function expandQueryKey(queryKey: FullQueryKey): FullQueryKey[] {
	const [ preferences, mode, backend, ...rest ] = queryKey;

	if (typeof backend === 'string' && backend === 'auto') {
		return Object.keys(backends).map(backend => [ preferences, mode, backend as any, ...rest ]);
	}

	if (typeof backend === 'string' && backend in backends) {
		return [ queryKey ];
	}

	invariant(false, `Invalid backend: ${backend}`);
}

type UseAppQueryResult<TData, TError> = Pick<UseQueryResult<TData, TError>, 'data' | 'isInitialLoading'>;

function useMergeAppQueryResults<TError>(
	queryResults: UseQueryResult<EventSet, TError>[],
): UseAppQueryResult<EventSet, TError> {
	const isInitialLoading = useMemo(() => {
		const everyDone = queryResults.every(queryResult => !queryResult.isInitialLoading);
		const someDoneAndNonEmpty = queryResults.some(queryResult => (
			(
				queryResult.data
					&& queryResult.data.size > 0
			) && !queryResult.isInitialLoading
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
		isInitialLoading,
	}), [
		data,
		isInitialLoading,
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
	const [ mode, backend, network, shortParameters, ...resource ] = shortQueryKey;

	const parameters: QueryKeyParameters = {
		relays: shortParameters?.relays?.sort() ?? [],
	};

	return [ queryPreferences, mode, backend, network, parameters, ...resource ];
}

function useFullQueryKey(shortQueryKey: ShortQueryKey): FullQueryKey {
	const queryPreferences = useQueryPreferences();

	return useMemo(() => {
		return shortQueryKeyToFullQueryKey(shortQueryKey, queryPreferences);
	}, [ queryPreferences, shortQueryKey ]);
}

type UseAppQueryError = unknown;

export type UseAppQueryOptions = Omit<UseQueryOptions<EventSet, UseAppQueryError, EventSet, ShortQueryKey>, 'queryKey' | 'queryFn'>;

/**
 * @deprecated Use trpc instead
 */
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
