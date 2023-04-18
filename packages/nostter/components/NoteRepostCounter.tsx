import { FaRetweet } from 'react-icons/fa';
import { NoteCounter } from "./NoteCounter";
import { EventPointer } from 'nostr-tools/lib/nip19';
import { useRepostNotesQuery } from '@/hooks/useRepostNotesQuery';

export function NoteRepostCounter({
	noteEventPointer,
}: {
	noteEventPointer: EventPointer;
}) {
	const repostNotesQuery = useRepostNotesQuery({ eventPointer: noteEventPointer });

	return (
		<NoteCounter
			iconComponent={FaRetweet}
			value={repostNotesQuery.data?.size ?? 0}
		/>
	);
}
