import { EventPointer } from 'nostr-tools/lib/nip19';
import styles from './NoteCounters.module.css';
import { NoteReplyCounter } from './NoteReplyCounter';

export function NoteCounters({
	noteEventPointer,
}: {
	noteEventPointer: EventPointer;
}) {
	return (
		<div
			className={styles.noteCounters}
		>
			<NoteReplyCounter
				noteEventPointer={noteEventPointer}
			/>
		</div>
	);
}
