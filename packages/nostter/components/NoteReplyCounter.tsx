import { FaRegComment } from 'react-icons/fa';
import { NoteCounter } from "./NoteCounter";
import { useDescendantNotesQuery } from '@/hooks/useDescendantNotesQuery';
import { EventPointer } from 'nostr-tools/lib/nip19';
import { useChildNoteEvents } from '@/hooks/useChildNoteEvents';

export function NoteReplyCounter({
	noteEventPointer,
}: {
	noteEventPointer: EventPointer;
}) {
	const descendantNotesQuery = useDescendantNotesQuery({ eventPointer: noteEventPointer });

	const childNoteEvents = useChildNoteEvents({
		id: noteEventPointer.id,
		descendantNoteEvents: descendantNotesQuery.data?.events,
	});

	return (
		<NoteCounter
			iconComponent={FaRegComment}
			value={childNoteEvents.length ?? 0}
		/>
	);
}
