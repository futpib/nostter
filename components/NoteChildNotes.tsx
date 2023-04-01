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
	const descendantNotesUrl = `${publicUrl}/api/event/${id}/descendants`;
	const descendantNotesQuery = useQuery([ descendantNotesUrl ], async (): Promise<{ events: Event[] }> => {
		return fetch(descendantNotesUrl).then((response) => response.json())
	});

	const childNoteEvents = useMemo(() => {
		const descendantNoteEvents = descendantNotesQuery.data?.events || [];

		return descendantNoteEvents.filter(descendantNoteEvent => {
			const references = parseReferences(descendantNoteEvent);

			const { contentTokens } = renderNoteContent({
				content: descendantNoteEvent.content,
				references,
				pubkeyMetadatas: new Map(),
			});

			const contentReferencedEvents = getContentReferencedEvents(contentTokens);

			const descendantThread = getThread(descendantNoteEvent, {
				contentReferencedEvents,
			});

			return (
				descendantThread.reply?.id === id
				|| descendantThread.root?.id === id
			);
		});
	}, [ id, descendantNotesQuery.data ]);

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
