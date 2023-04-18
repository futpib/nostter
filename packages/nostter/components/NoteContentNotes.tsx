import { EventPointer } from 'nostr-tools/lib/nip19';
import { NoteLoader } from './NoteLoader';

export function NoteContentNotes({
	contentReferencedEvents,
}: {
	contentReferencedEvents: EventPointer[];
}) {
	return (
		<>
			{contentReferencedEvents.map((eventPointer) => (
				<NoteLoader
					key={eventPointer.id}
					componentKey="EmbeddedNoteLink"
					eventPointer={eventPointer}
				/>
			))}
		</>
	);
}
