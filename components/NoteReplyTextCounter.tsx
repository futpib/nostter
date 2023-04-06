import { NoteTextCounter } from "./NoteTextCounter";
import { useDescendantNotesQuery } from '@/hooks/useDescendantNotesQuery';
import { EventPointer } from 'nostr-tools/lib/nip19';
import { useChildNoteEvents } from '@/hooks/useChildNoteEvents';

export function NoteReplyTextCounter({
	noteEventPointer,
}: {
	noteEventPointer: EventPointer;
}) {
	const descendantNotesQuery = useDescendantNotesQuery({ eventPointer: noteEventPointer });

	const childNoteEvents = useChildNoteEvents({
		id: noteEventPointer.id,
		descendantNoteEvents: descendantNotesQuery.data?.events,
	});

	return childNoteEvents.length > 0 ? (
		<NoteTextCounter
			value={childNoteEvents.length}
			label="Replies"
		/>
	) : null;
}
