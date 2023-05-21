
import Link from 'next/link';
import styles from './EmbeddedNoteNotFound.module.css';

export function EmbeddedNoteNotFound({
	id,
}: {
	id: string;
}) {
	return (
		<div className={styles.embeddedNoteNotFound}>
			Note not found.
			{' '}
			<Link
				className={styles.embeddedNoteNotFoundLink}
				href={`https://www.nostr.guru/e/${id}`}
				target="_blank"
			>
				Open in Nostr Guru
			</Link>
		</div>
	);
}
