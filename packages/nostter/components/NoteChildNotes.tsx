"use client";

import { NoteLoader } from './NoteLoader';
import { useDescendantNotesQuery } from '@/hooks/useDescendantNotesQuery';
import { useChildNoteEvents } from '@/hooks/useChildNoteEvents';
import { useMemo } from 'react';
import { EventSet } from '@/nostr/EventSet';
import { useIdleLoop } from '@/hooks/useIdleLoop';

export function NoteChildNotes({
	id,
}: {
	id: string;
}) {
	const {
		data,
		isFetching,
		hasNextPage,
		fetchNextPage,
	} = useDescendantNotesQuery({ eventPointer: { id } });

	const descendantNoteEvents = useMemo(() => {
		const descendantNoteEvents = new EventSet();

		for (const page of data?.pages ?? []) {
			for (const event of page.eventSet) {
				descendantNoteEvents.add(event);
			}
		}

		return descendantNoteEvents;
	}, [ data ]);

	const childNoteEvents = useChildNoteEvents({
		id,
		descendantNoteEvents: Array.from(descendantNoteEvents),
	});

	useIdleLoop(fetchNextPage, {
		enabled: Boolean(!isFetching && hasNextPage),
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
