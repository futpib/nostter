'use client';

import { EventPointer } from 'nostr-tools/lib/nip19';
import styles from './NoteTextCounters.module.css';
import { NoteReplyTextCounter } from './NoteReplyTextCounter';
import { NoteLikeTextCounter } from './NoteLikeTextCounter';
import { NoteRepostTextCounter } from './NoteRepostTextCounter';

export function NoteTextCounters({
	noteEventPointer,
}: {
	noteEventPointer: EventPointer;
}) {
	return (
		<div
			className={styles.noteTextCounters}
		>
			<NoteReplyTextCounter
				noteEventPointer={noteEventPointer}
			/>

			<NoteRepostTextCounter
				noteEventPointer={noteEventPointer}
			/>

			<NoteLikeTextCounter
				noteEventPointer={noteEventPointer}
			/>
		</div>
	);
}
