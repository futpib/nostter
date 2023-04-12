"use client";

import { useAppInfiniteQuery } from '@/hooks/useAppQuery';
import { useEffect, useMemo } from 'react';
import { NoteLoader } from './NoteLoader';
import { useVisibleEventsLimitScroll } from '@/hooks/useVisibleEventsLimitScroll';
import { DateTime } from 'luxon';

export function AllNotes() {
	const now = useMemo(() => DateTime.local(), []);

	const notesInfiniteQuery = useAppInfiniteQuery([
		'infinite',
		'auto',
		'nostr',
		undefined,
		'events',
		Math.ceil(now.toSeconds()),
	]);

	const eventSet = notesInfiniteQuery.data;

	const eventsLatestFirst = useMemo(() => {
		return eventSet.getEventsLatestFirst();
	}, [eventSet]);

	const {
		visibleEventsLimit,
	} = useVisibleEventsLimitScroll({
		isLoading: notesInfiniteQuery.isLoading,
	});

	const visibleEvents = useMemo(() => {
		return eventsLatestFirst.slice(0, visibleEventsLimit);
	}, [eventsLatestFirst, visibleEventsLimit]);

	useEffect(() => {
		if (notesInfiniteQuery.isLoading) {
			return;
		}

		if (eventsLatestFirst.length < visibleEventsLimit) {
			notesInfiniteQuery.fetchNextPage();
		}
	}, [ eventsLatestFirst, visibleEventsLimit, notesInfiniteQuery.isLoading ]);

	return (
		<>
			{visibleEvents.map((note) => (
				<NoteLoader
					key={note.id}
					componentKey="TimelineNoteLink"
					eventPointer={note}
				/>
			))}
		</>
	);
}
