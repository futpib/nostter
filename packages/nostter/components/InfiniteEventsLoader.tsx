"use client";

import { Fragment, useCallback } from 'react';
import { DateTime } from 'luxon';
import { NoteSkeleton } from './NoteSkeleton';
import plur from 'plur';
import styles from './ProfileNotes.module.css';
import { EventLoader } from './EventLoader';
import { EventSet } from '@/nostr/EventSet';
import invariant from 'invariant';
import { Cursor } from '@/trpc/router/nostr';
import { ShowFutureNotesButton } from './ShowFutureNotesButton';
import { InfiniteEventsLoaderInput, useInfiniteEventsLoader } from '@/hooks/useInfiniteEventsLoader';

export function InfiniteEventsLoader({
	id,
	input,
	enabled = true,
	pubkeyPreloadedEventSet,
	now,
}: {
	id: string;
	input: InfiniteEventsLoaderInput;
	enabled?: boolean;
	pubkeyPreloadedEventSet?: EventSet;
	now?: string | DateTime;
}) {
	const {
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
	} = useInfiniteEventsLoader({
		now,
		input,
		enabled,
		pubkeyPreloadedEventSet,
	});

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

		showFutureEvents({
			pages: [ {
				eventSet,
				nextCursor,
			} ],
		});
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
					id={id}
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
										id={id}
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
