"use client";

import { Fragment, useEffect, useMemo } from 'react';
import { trpcReact } from '@/clients/trpc';
import { EventKind } from '@/nostr/EventKind';
import { DateTime } from 'luxon';
import { NoteSkeleton } from './NoteSkeleton';
import { useTrackVisibility } from 'react-intersection-observer-hook';

import styles from './ProfileNotes.module.css';
import { useNow } from '@/hooks/useNow';
import { EventLoader } from './EventLoader';

export function ProfileNotes({
	pubkey,
	now: propsNow,
}: {
	pubkey: string;
	now?: string | DateTime;
}) {
	const now = useNow({ propsNow });

	const [ lastPageLastEventWrapRef, {
		isVisible: lastPageLastEventWrapVisible,
	}] = useTrackVisibility();

	const [ lastPageFirstEventWrapRef, {
		isVisible: lastPageFirstEventWrapVisible,
	}] = useTrackVisibility();

	const input = {
		kinds: [ EventKind.Text, EventKind.Repost ],
		authors: [ pubkey ],
	};

	const nowRounded = useMemo(() => {
		const startOfMinute = now.startOf('minute');
		const reminder = startOfMinute.minute % 5;

		return startOfMinute.minus({ minutes: reminder });
	}, [ now ]);

	const initialCursor = useMemo(() => ({
		until: nowRounded.toSeconds(),
		limit: 16,
	}), [ nowRounded ]);

	const { data: localFirstPageData } = trpcReact.nostr.infiniteEvents.useInfiniteQuery({
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

	const { data: backendFirstPageData } = trpcReact.nostr.infiniteEvents.useInfiniteQuery({
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

	const { isInitialLoading, isFetchingNextPage, data, fetchNextPage, hasNextPage } = trpcReact.nostr.infiniteEvents.useInfiniteQuery({
		kinds: [ EventKind.Text, EventKind.Repost ],
		authors: [ pubkey ],
	}, {
		getNextPageParam(lastPage) {
			return lastPage.nextCursor;
		},

		initialCursor,
	});

	useEffect(() => {
		if (!hasNextPage) {
			return;
		}

		if (lastPageLastEventWrapVisible || lastPageFirstEventWrapVisible) {
			fetchNextPage();
		}

	}, [ lastPageLastEventWrapVisible, lastPageFirstEventWrapVisible, hasNextPage ]);

	const pages = useMemo(() => {
		if (data && data.pages.length > 0) {
			return data.pages;
		}

		if (backendFirstPageData && backendFirstPageData.pages.length > 0) {
			return backendFirstPageData.pages;
		}

		if (localFirstPageData && localFirstPageData.pages.length > 0) {
			return localFirstPageData.pages;
		}

		return data?.pages ?? [];
	}, [
		localFirstPageData?.pages.length,
		backendFirstPageData?.pages.length,
		data?.pages.length,
	]);

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

			return page.eventSet.getEventsLatestFirst().filter((event) => {
				if (nextPage?.eventSet.has(event.id)) {
					return false;
				}

				return true;
			});
		});
	}, [ pages ]);

	return (
		<>
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
