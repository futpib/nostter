"use client";

import { NoteLoader } from './NoteLoader';
import { useDescendantNotesQuery } from '@/hooks/useDescendantNotesQuery';
import { useChildNoteEvents } from '@/hooks/useChildNoteEvents';

export function NoteChildNotes({
	id,
}: {
	id: string;
}) {
	const descendantNotesQuery = useDescendantNotesQuery({ eventPointer: { id } });

	const childNoteEvents = useChildNoteEvents({
		id,
		descendantNoteEvents: descendantNotesQuery.data?.events,
	});

	return (
		<>
			{childNoteEvents.flatMap(childNoteEvent => childNoteEvent ? (
				<NoteLoader
					key={childNoteEvent.id}
					componentKey="ChildNoteLink"
					eventPointer={childNoteEvent}
				/>
			) : [])}
		</>
	);
}
