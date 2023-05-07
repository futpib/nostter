
import Link from 'next/link';
import styles from './NoteNotFound.module.css';

export function NoteNotFound({
	id,
}: {
	id: string;
}) {
	return (
		<div className={styles.noteNotFound}>
			<div className={styles.noteNotFoundInner}>
				Note not found.
				{' '}
				<Link
					className={styles.noteNotFoundLink}
					href={`https://www.nostr.guru/e/${id}`}
					target="_blank"
				>
					Open in Nostr Guru
				</Link>
			</div>
		</div>
	);
}
