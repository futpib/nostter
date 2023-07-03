import { TRPCQueryKey } from "@/clients/prehashQueryKey";
import { trpcReact } from "@/clients/trpc";
import { startOf } from "@/luxon";
import { EventSet } from "@/nostr/EventSet";
import { EventsInput } from "@/trpc/router/nostr";
import { useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNow } from "./useNow";
import { useVisibility } from "./useVisibility";

export type InfiniteEventsLoaderInput = Omit<EventsInput, 'cursor' | 'cacheKeyNonce'>;

export function useInfiniteEventsLoader({
	input,
	enabled = true,
	pubkeyPreloadedEventSet,
	now: propsNow,
}: {
	input: InfiniteEventsLoaderInput;
	enabled?: boolean;
	pubkeyPreloadedEventSet?: EventSet;
	now?: string | DateTime;
}) {
	const initialNow = useNow({ propsNow });

	const [ now, setNow ] = useState(initialNow);

	const {
		ref: lastPageFirstEventWrapRef,
		isVisible: lastPageFirstEventWrapVisible,
	} = useVisibility();

	const {
		ref: lastPageLastEventWrapRef,
		isVisible: lastPageLastEventWrapVisible,
	} = useVisibility();

	const queryKey = useMemo((): TRPCQueryKey => [
		[ 'nostr', 'eventsInfinite' ],
		{
			type: 'infinite',
			input,
		},
	], [ input ]);

	const nowRounded = useMemo(() => startOf(now, '5minutes'), [ now ]);

	const initialCursor = useMemo(() => ({
		until: nowRounded.toSeconds(),
		limit: 16,
	}), [ nowRounded ]);

	const pubkeyPreloadedFirstPageData = useMemo(() => {
		if (!pubkeyPreloadedEventSet) {
			return undefined;
		}

		const eventSet = pubkeyPreloadedEventSet.filter(input);

		if (eventSet.size === 0) {
			return undefined;
		}

		return {
			pages: [
				{
					eventSet,
				},
			],
		};
	}, [ input, pubkeyPreloadedEventSet ]);

	const {
		data: localFirstPageData,
		isInitialLoading: isLocalFirstPageInitialLoading,
	} = trpcReact.nostr.eventsInfinite.useInfiniteQuery({
		...input,
		cacheKeyNonce: 'local',
	}, {
		enabled: enabled !== false,

		trpc: {
			context: {
				forceLink: 'local',
			},
		},

		initialCursor,
	});

	const {
		data: backendFirstPageData,
		isInitialLoading: isBackendFirstPageInitialLoading,
	} = trpcReact.nostr.eventsInfinite.useInfiniteQuery({
		...input,
		cacheKeyNonce: 'backend',
	}, {
		enabled: enabled !== false,

		trpc: {
			context: {
				forceLink: 'backend',
			},
		},

		initialCursor,
	});

	if (Array.isArray(backendFirstPageData?.pages.at(0)?.eventSet)) {
		debugger;
	}

	const {
		isInitialLoading,
		isFetchingNextPage,
		data,
		fetchNextPage,
		hasNextPage,
	} = trpcReact.nostr.eventsInfinite.useInfiniteQuery(input, {
		enabled: enabled !== false,

		getNextPageParam(lastPage) {
			return lastPage.nextCursor;
		},

		initialCursor,
	});

	const [ refetchCount, setRefetchCount ] = useState(0);
	const [ afterNowRoundedEventSet, setAfterNowRoundedEventSet ] = useState(() => new EventSet());
	const [ afterNowRoundedEventsCount, setAfterNowRoundedEventsCount ] = useState(0);

	trpcReact.nostr.eventsSubscription.useSubscription({
		...input,
		cursor: {
			since: nowRounded.toSeconds(),
		},
		cacheKeyNonce: String(refetchCount),
	}, {
		enabled: (
			enabled !== false
				&& !isInitialLoading
				&& !isLocalFirstPageInitialLoading
				&& !isBackendFirstPageInitialLoading
		),

		onData(event) {
			afterNowRoundedEventSet.add(event);
			setAfterNowRoundedEventsCount(afterNowRoundedEventSet.size);
		},
	});

	useEffect(() => {
		if (!hasNextPage) {
			return;
		}

		if (lastPageLastEventWrapVisible || lastPageFirstEventWrapVisible) {
			fetchNextPage();
		}

	}, [ lastPageLastEventWrapVisible, lastPageFirstEventWrapVisible, hasNextPage ]);

	const [ futurePage, pages ] = useMemo(() => {
		if (data && data.pages.length > 0) {
			const futurePage = {
				eventSet: new EventSet(),
			};

			const zeroPage = {
				eventSet: new EventSet(),
			};

			for (const event of afterNowRoundedEventSet.getEventsOldestFirst()) {
				const somePastPageHasEvent = data?.pages.some((page) => {
					if (page.eventSet.has(event.id)) {
						return true;
					}

					return false;
				});

				if (somePastPageHasEvent) {
					continue;
				}

				if (event.created_at > now.toSeconds()) {
					futurePage.eventSet.add(event);
					continue;
				}

				zeroPage.eventSet.add(event);
			}

			return [ futurePage, [ zeroPage ].concat(data?.pages ?? []) ];
		}

		if (backendFirstPageData && backendFirstPageData.pages.length > 0) {
			return [ undefined, backendFirstPageData.pages ];
		}

		if (localFirstPageData && localFirstPageData.pages.length > 0) {
			return [ undefined, localFirstPageData.pages ];
		}

		if (pubkeyPreloadedFirstPageData && pubkeyPreloadedFirstPageData.pages.length > 0) {
			return [ undefined, pubkeyPreloadedFirstPageData.pages ];
		}

		return [ undefined, [] ];
	}, [
		localFirstPageData?.pages.length,
		backendFirstPageData?.pages.length,
		pubkeyPreloadedFirstPageData?.pages.length,
		data?.pages.length,
		afterNowRoundedEventsCount,
		now,
	]);

	const firstNonEmptyPage = useMemo(() => {
		return pages.find(page => page.eventSet.size > 0);
	}, [ pages ]);

	const lastNonEmptyPage = useMemo(() => {
		return pages.findLast(page => page.eventSet.size > 0);
	}, [ pages ]);

	const lastPageFirstEvent = useMemo(() => {
		if (!lastNonEmptyPage) {
			return undefined;
		}

		return lastNonEmptyPage.eventSet.getLatestEvent();
	}, [ lastNonEmptyPage ]);

	const lastPageLastEvent = useMemo(() => {
		if (!lastNonEmptyPage) {
			return undefined;
		}

		return lastNonEmptyPage.eventSet.getOldestEvent();
	}, [ lastNonEmptyPage ]);

	const eventsLatestFirst = useMemo(() => {
		return pages.flatMap((page, index) => {
			const nextPage = pages.at(index + 1);

			if (!page.eventSet.getEventsLatestFirst) {
				debugger;
			}

			return page.eventSet.getEventsLatestFirst().filter((event) => {
				if (nextPage?.eventSet.has(event.id)) {
					return false;
				}

				return true;
			});
		});
	}, [ pages ]);

	const queryClient = useQueryClient();

	const showFutureEvents = useCallback((data: any) => {
		queryClient.setQueryData(queryKey, data);

		setNow(DateTime.local());
		setAfterNowRoundedEventSet(new EventSet());
		setAfterNowRoundedEventsCount(0);
		setRefetchCount((count) => count + 1);
	}, [ queryClient, queryKey ]);

	return {
		lastPageLastEventWrapRef,
		lastPageFirstEventWrapRef,

		initialCursor,

		isInitialLoading,
		isFetchingNextPage,

		futurePage,
		firstNonEmptyPage,

		lastPageLastEvent,
		lastPageFirstEvent,

		eventsLatestFirst,

		showFutureEvents,
	};
}
