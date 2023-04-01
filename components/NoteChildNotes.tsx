"use client";

import { NoteLoader } from './NoteLoader';
import { Event } from 'nostr-tools';
import { useQuery } from '@tanstack/react-query';
import { getPublicRuntimeConfig } from '@/utils/getPublicRuntimeConfig';

export function NoteChildNotes({
	id,
}: {
	id: string;
}) {
	const { publicUrl } = getPublicRuntimeConfig();
	const childNotesUrl = `${publicUrl}/api/event/${id}/children`;
	const childNotesQuery = useQuery([ childNotesUrl ], async (): Promise<{ events: Event[] }> => {
		return fetch(childNotesUrl).then((response) => response.json())
	});

	const childNotes = childNotesQuery.data?.events || [];

	return (
		<>
			{childNotes.flatMap((event) => event ? (
				<NoteLoader
					key={event.id}
					componentKey="ChildNoteLink"
					eventPointer={event}
				/>
			) : [])}
		</>
	);
}
