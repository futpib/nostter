"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { trpcReact } from '@/clients/trpc';
import { EventKind } from '@/nostr/EventKind';
import { DateTime } from 'luxon';
import { NoteSkeleton } from './NoteSkeleton';
import plur from 'plur';
import styles from './ProfileNotes.module.css';
import { useNow } from '@/hooks/useNow';
import { EventLoader } from './EventLoader';
import { EventSet } from '@/nostr/EventSet';
import { TRPCQueryKey } from '@/clients/prehashQueryKey';
import { useQueryClient } from '@tanstack/react-query';
import invariant from 'invariant';
import { Cursor } from '@/trpc/router/nostr';
import { startOf } from '@/luxon';
import { useVisibility } from '@/hooks/useVisibility';
import { ShowFutureNotesButton } from './ShowFutureNotesButton';

export function ProfileNotes({
	pubkey,
	now: propsNow,
}: {
	pubkey: string;
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

	const input = useMemo(() => ({
		kinds: [ EventKind.Text, EventKind.Repost ],
		authors: [ pubkey ],
	}), [ pubkey ]);

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

	const {
		data: localFirstPageData,
		isInitialLoading: isLocalFirstPageInitialLoading,
	} = trpcReact.nostr.eventsInfinite.useInfiniteQuery({
		...input,
		cacheKeyNonce: 'local',
	}, {
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
		trpc: {
			context: {
				forceLink: 'backend',
			},
		},

		initialCursor,
	});

	const {
		isInitialLoading,
		isFetchingNextPage,
		data,
		fetchNextPage,
		hasNextPage,
	} = trpcReact.nostr.eventsInfinite.useInfiniteQuery(input, {
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
			!isInitialLoading
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

		return [ undefined, [] ];
	}, [
		localFirstPageData?.pages.length,
		backendFirstPageData?.pages.length,
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

	const handleShowFutureNotesClick = useCallback(() => {
		invariant(futurePage, 'futurePage should be defined');
		invariant(futurePage.eventSet.size > 0, 'futurePage.eventSet.size should be > 0');

		const eventSet = new EventSet();
		const nextCursor: Cursor = {
			limit: initialCursor.limit,
		};

		for (const event of futurePage.eventSet.getEventsLatestFirst()) {
			if (eventSet.size >= initialCursor.limit) {
				break;
			}

			eventSet.add(event);
			nextCursor.until = event.created_at;
		}

		for (const event of firstNonEmptyPage?.eventSet.getEventsLatestFirst() ?? []) {
			if (eventSet.size >= initialCursor.limit) {
				break;
			}

			eventSet.add(event);
			nextCursor.until = event.created_at;
		}

		queryClient.setQueryData(queryKey, {
			pages: [ {
				eventSet,
				nextCursor,
			} ],
		});

		setNow(DateTime.local());
		setAfterNowRoundedEventSet(new EventSet());
		setAfterNowRoundedEventsCount(0);
		setRefetchCount((count) => count + 1);
	}, [ futurePage, firstNonEmptyPage ]);

	return (
		<>
			<ShowFutureNotesButton
				visible={Boolean(futurePage && futurePage.eventSet.size > 0)}
				onClick={handleShowFutureNotesClick}
				pillChildren="New notes"
				buttonChildren={(
					<>
						Show {futurePage?.eventSet.size} {plur('Note', futurePage?.eventSet.size)}
					</>
				)}
			/>

			{(isInitialLoading && eventsLatestFirst.length === 0) ? (
				<NoteSkeleton
					id={pubkey}
				/>
			) : eventsLatestFirst.map(event => {
				return (
					<Fragment key={event.id}>
						{event.id === lastPageLastEvent?.id ? (
							<div
								ref={lastPageLastEventWrapRef}
								className={styles.lastPageLastEventWrap}
							>
								<EventLoader
									componentKey="TimelineEvent"
									eventPointer={event}
									event={event}
								/>
								{isFetchingNextPage && (
									<NoteSkeleton
										id={pubkey}
									/>
								)}
							</div>
						) : event.id === lastPageFirstEvent?.id ? (
							<div
								ref={lastPageFirstEventWrapRef}
								className={styles.lastPageFirstEventWrap}
							>
								<EventLoader
									componentKey="TimelineEvent"
									eventPointer={event}
									event={event}
								/>
							</div>
						) : (
							<>
								<EventLoader
									componentKey="TimelineEvent"
									eventPointer={event}
									event={event}
								/>
							</>
						)}
					</Fragment>
				);
			})}
		</>
	);
}
