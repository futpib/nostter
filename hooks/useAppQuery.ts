import invariant from "invariant";
import { UseQueryOptions, UseQueryResult, useQueries, QueriesOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import { usePreferences } from "./usePreferences";
import { EventSet } from "@/nostr/EventSet";
import { handleSuccess } from "@/clients/handleSuccess";

type UseAppQueryResult<TData, TError> = Pick<UseQueryResult<TData, TError>, 'data' | 'isLoading'>;

type QueryKeyParameters = {
	relays: string[];
};

type QueryKeyResource =
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
	parameters: QueryKeyParameters,
	...resource: QueryKeyResource,
];

type QueryKeyPreferences = {
	relays: string[],
};

export type FullQueryKey = readonly [
	preferences: QueryKeyPreferences,
	...shortQueryKey: ShortQueryKey,
]

const backends = {
	'api': {},
	'pool': {},
	'local': {},
};

function expandQueryKey<TQueryKey extends FullQueryKey>(queryKey: TQueryKey): TQueryKey[] {
	const [ preferences, backend, ...rest ] = queryKey;

	if (typeof backend === 'string' && backend === 'auto') {
		return Object.keys(backends).map(backend => [ preferences, backend, ...rest ] as unknown as TQueryKey);
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

type UseAppQueryError = unknown;

export type UseAppQueryOptions = Omit<UseQueryOptions<EventSet, UseAppQueryError, EventSet, ShortQueryKey>, 'queryKey' | 'queryFn'>;

export function useAppQuery(
	shortQueryKey: ShortQueryKey,
	options?: UseAppQueryOptions,
): UseAppQueryResult<EventSet, UseAppQueryError> {
	const queryPreferences = useQueryPreferences();

	const fullQueryKey = useMemo(() => [ queryPreferences, ...shortQueryKey ] as any, [ queryPreferences, shortQueryKey ]);

	const queryKeys = useMemo(() => expandQueryKey(fullQueryKey), [ fullQueryKey ]);

	const queryResults = useQueries({
		queries: queryKeys.map((queryKey): UseAppQueryOptions & { queryKey: any } => ({
			...options,
			queryKey,
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
			const fullQueryKeys = expandQueryKey([ queryPreferences, ...query.queryKey ] as any);

			return fullQueryKeys.map((fullQueryKey): UseAppQueryOptions => ({
				...query,
				queryKey: fullQueryKey,
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
