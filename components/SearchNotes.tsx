"use client";

import { useAppInfiniteQuery } from '@/hooks/useAppQuery';
import { NoteLoader } from './NoteLoader';

export function SearchNotes({
	query,
}: {
	query: string;
}) {
	const notesQuery = useAppInfiniteQuery([
		'finite',
		'auto',
		'nostr',
		undefined,
		'search',
		query,
	]);

	const eventSet = notesQuery.data;

	return (
		<>
			{[...eventSet].map((note) => (
				<NoteLoader
					key={note.id}
					componentKey="TimelineNoteLink"
					eventPointer={note}
				/>
			))}
		</>
	);
}
