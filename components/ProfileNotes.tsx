"use client";

import { useAppInfiniteQuery } from '@/hooks/useAppQuery';
import { useEffect, useMemo, useState } from 'react';
import { NoteLoader } from './NoteLoader';

export function ProfileNotes({
	pubkey,
}: {
	pubkey: string;
}) {
	const [ visibleEventsLimit, setVisibleEventsLimit ] = useState(8);

	const notesInfiniteQuery = useAppInfiniteQuery([
		'infinite',
		'auto',
		'nostr',
		undefined,
		'pubkey',
		pubkey,
		'notes',
	]);

	const eventSet = notesInfiniteQuery.data;

	const eventsLatestFirst = useMemo(() => {
		return eventSet.getEventsLatestFirst();
	}, [eventSet]);

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

	useEffect(() => {
		if (notesInfiniteQuery.isLoading) {
			return;
		}

		const handleScroll = () => {
			const clientHeight = document.documentElement.clientHeight;
			const documentOverflowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
			const scrollPosition = document.documentElement.scrollTop;

			if (scrollPosition > documentOverflowHeight - clientHeight) {
				setVisibleEventsLimit((prev) => prev + 8);
			}
		};

		handleScroll();

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, [ notesInfiniteQuery.isLoading ]);

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
