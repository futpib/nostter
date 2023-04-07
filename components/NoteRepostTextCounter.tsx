import { NoteTextCounter } from "./NoteTextCounter";
import { EventPointer } from 'nostr-tools/lib/nip19';
import { useRepostNotesQuery } from "@/hooks/useRepostNotesQuery";

export function NoteRepostTextCounter({
	noteEventPointer,
}: {
	noteEventPointer: EventPointer;
}) {
	const repostNotesQuery = useRepostNotesQuery({ eventPointer: noteEventPointer });

	const repostNoteEvents = repostNotesQuery.data?.events ?? [];

	return repostNoteEvents.length > 0 ? (
		<NoteTextCounter
			value={repostNoteEvents.length}
			label="Reposts"
		/>
	) : null;
}
