"use client";

import { NoteLoader } from './NoteLoader';
import { Event, parseReferences } from 'nostr-tools';
import { useQuery } from '@tanstack/react-query';
import { getPublicRuntimeConfig } from '@/utils/getPublicRuntimeConfig';
import { useMemo } from 'react';
import { renderNoteContent } from '@/utils/renderNoteContent';
import { getContentReferencedEvents } from '@/utils/getContentReferencedEvents';
import { getThread } from '@/utils/getThread';

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

	const childNotes = useMemo(() => {
		const childNoteEvents = childNotesQuery.data?.events || [];

		return childNoteEvents.filter(childNoteEvent => {
			const references = parseReferences(childNoteEvent);

			const { contentTokens } = renderNoteContent({
				content: childNoteEvent.content,
				references,
				pubkeyMetadatas: new Map(),
			});

			const contentReferencedEvents = getContentReferencedEvents(contentTokens);

			const childThread = getThread(childNoteEvent, {
				contentReferencedEvents,
			});

			return (
				childThread.reply?.id === id
				|| childThread.root?.id === id
			);
		});
	}, [ id, childNotesQuery.data ]);

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
