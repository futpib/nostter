"use client";

import { Fragment, useEffect, useMemo, useRef } from 'react';
import { trpcReact } from '@/clients/trpc';
import { EventKind } from '@/nostr/EventKind';
import { DateTime } from 'luxon';
import { NoteLoader } from './NoteLoader';
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

	const [ lastEventWrapRef, {
		isVisible: lastEventWrapVisible,
	}] = useTrackVisibility();

	const { isFetchingNextPage, data, fetchNextPage, hasNextPage } = trpcReact.nostr.infiniteEvents.useInfiniteQuery({
		kinds: [ EventKind.Text, EventKind.Repost ],
		authors: [ pubkey ],
	}, {
		getNextPageParam(lastPage) {
			return lastPage.nextCursor;
		},

		initialCursor: {
			until: now.startOf('minute').toSeconds(),
			limit: 16,
		},
	});

	useEffect(() => {
		if (!lastEventWrapVisible) {
			return;
		}

		if (!hasNextPage) {
			return;
		}

		fetchNextPage();
	}, [ lastEventWrapVisible, hasNextPage ]);

	const lastNonEmptyPage = useMemo(() => {
		if (!data) {
			return undefined;
		}

		return data.pages.findLast(page => page.eventSet.size > 0);
	}, [ data ]);

	const lastEvent = useMemo(() => {
		if (!lastNonEmptyPage) {
			return undefined;
		}

		return lastNonEmptyPage.eventSet.getOldestEvent();
	}, [ lastNonEmptyPage ]);

	return (
		<>
			{data?.pages.map((page, index) => {
				const nextPage = data.pages.at(index + 1);

				return (
					<Fragment key={page.nextCursor?.until ?? index}>
						{page.eventSet.getEventsLatestFirst().map((event) => {
							if (nextPage?.eventSet.has(event.id)) {
								return null;
							}

							return (
								<Fragment key={event.id}>
									{page === lastNonEmptyPage && event.id === lastEvent?.id ? (
										<div
											ref={lastEventWrapRef}
											className={styles.lastEventWrap}
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
					</Fragment>
				);
			})}
		</>
	);
}
