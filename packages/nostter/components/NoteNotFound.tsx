
import { ExternalLink } from './ExternalLink';
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
				<ExternalLink
					href={`https://www.nostr.guru/e/${id}`}
				>
					Open in Nostr Guru
				</ExternalLink>
			</div>
		</div>
	);
}
