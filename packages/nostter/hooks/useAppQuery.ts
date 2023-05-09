import invariant from "invariant";
import { UseQueryOptions, UseQueryResult, useQueries, QueriesOptions, useInfiniteQuery, UseInfiniteQueryOptions } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { usePreferences } from "./usePreferences";
import { EventSet } from "@/nostr/EventSet";
import { handleSuccess } from "@/clients/handleSuccess";
import { PrehashedQueryKey, prehashQueryKey } from "@/clients/prehashQueryKey";
import { getStaleTime } from "@/clients/staleTime";
import { PageParam, backends } from "@/clients/queryFn";

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
	| readonly [
		resource: 'events',
		since: number,
	]
	| readonly [
		resource: 'pubkey',
		pubkey: undefined | string,
		...rest:
			| [ subresource: 'metadata' | 'notes' ]
	]
	| readonly [
		resource: 'search',
		query: string,
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

/**
 * @deprecated Use trpc instead
 */
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

type UseAppInfiniteQueryResult = {
	data: EventSet;
	isInitialLoading: boolean;
	isLoading: boolean;
	fetchNextPage: () => void;
	fetchPreviousPage: () => void;
};

export type UseAppInfiniteQueryOptions = Omit<UseInfiniteQueryOptions<EventSet, UseAppQueryError, EventSet, EventSet, PrehashedQueryKey>, 'queryKey' | 'queryFn'>;

const seenEventSets = new WeakSet<EventSet>();

/**
 * @deprecated Use trpc instead
 */
export function useAppInfiniteQuery(
	shortQueryKey: ShortQueryKey,
	options?: UseAppInfiniteQueryOptions,
): UseAppInfiniteQueryResult {
	const fullQueryKey = useFullQueryKey(shortQueryKey);

	const [
		aQueryKey,
		bQueryKey,
		cQueryKey,
		...restQueryKeys
	] = expandQueryKey(fullQueryKey);

	invariant(restQueryKeys.length === 0, 'Infinite queries are not supported for more than 3 backends');

	const newOptions = useMemo((): UseAppInfiniteQueryOptions => ({
		...options,

		getNextPageParam(lastPage): PageParam {
			return {
				lastPageOldestEventCreatedAt: lastPage.getOldestEvent()?.created_at,
			};
		},

		getPreviousPageParam(firstPage): PageParam {
			return {
				firstPageLatestEventCreatedAt: firstPage.getLatestEvent()?.created_at,
			};
		},

		onSuccess(infiniteData) {
			for (const eventSet of infiniteData.pages) {
				if (seenEventSets.has(eventSet)) {
					continue;
				}

				handleSuccess(eventSet);

				seenEventSets.add(eventSet);
			}

			return options?.onSuccess?.(infiniteData);
		},
	}), [ options ]);

	const aQueryResult = useInfiniteQuery(prehashQueryKey(aQueryKey), newOptions);
	const bQueryResult = useInfiniteQuery(prehashQueryKey(bQueryKey), newOptions);
	const cQueryResult = useInfiniteQuery(prehashQueryKey(cQueryKey), newOptions);

	const isInitialLoading = useMemo(() => {
		const everyDone = [ aQueryResult, bQueryResult, cQueryResult ].every(queryResult => !queryResult.isInitialLoading);
		const someDoneAndNonEmpty = [ aQueryResult, bQueryResult, cQueryResult ].some(queryResult => (
			(
				queryResult.data
					&& queryResult.data.pages.length > 0
			) && !queryResult.isInitialLoading
		));

		return !(everyDone || someDoneAndNonEmpty);
	}, [ aQueryResult, bQueryResult, cQueryResult ]);

	const isLoading = useMemo(() => {
		return [ aQueryResult, bQueryResult, cQueryResult ].some(queryResult => queryResult.isLoading);
	}, [ aQueryResult, bQueryResult, cQueryResult ]);

	const data = useMemo(() => {
		const eventSet = new EventSet();

		for (const queryResult of [ aQueryResult, bQueryResult, cQueryResult ]) {
			for (const pageEventSet of queryResult.data?.pages ?? []) {
				for (const event of pageEventSet) {
					eventSet.add(event);
				}
			}
		}

		return eventSet;
	}, [ aQueryResult.data, bQueryResult.data, cQueryResult.data ]);

	const fetchNextPage = useCallback(() => {
		aQueryResult.fetchNextPage();
		bQueryResult.fetchNextPage();
		cQueryResult.fetchNextPage();
	}, [ aQueryResult, bQueryResult, cQueryResult ]);

	const fetchPreviousPage = useCallback(() => {
		aQueryResult.fetchPreviousPage();
		bQueryResult.fetchPreviousPage();
		cQueryResult.fetchPreviousPage();
	}, [ aQueryResult, bQueryResult, cQueryResult ]);

	return useMemo(() => ({
		isLoading,
		isInitialLoading,
		data,
		fetchNextPage,
		fetchPreviousPage,
	}), [
		isLoading,
		isInitialLoading,
		data,
		fetchNextPage,
		fetchPreviousPage,
	]);
}
