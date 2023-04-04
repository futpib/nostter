"use client";

import { NoteLoader } from './NoteLoader';
import { parseReferences } from 'nostr-tools';
import { useMemo } from 'react';
import { renderNoteContent } from '@/utils/renderNoteContent';
import { getContentReferencedEvents } from '@/utils/getContentReferencedEvents';
import { getThread } from '@/utils/getThread';
import { useDescendantNotesQuery } from '@/hooks/useDescendantNotesQuery';

export function NoteChildNotes({
	id,
}: {
	id: string;
}) {
	const descendantNotesQuery = useDescendantNotesQuery({ eventPointer: { id } });

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
				|| (
					!descendantThread.reply
					&& descendantThread.root?.id === id
				)
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
