
import styles from './EmbeddedNoteNotFound.module.css';
import { ExternalLink } from './ExternalLink';

export function EmbeddedNoteNotFound({
	id,
}: {
	id: string;
}) {
	return (
		<div className={styles.embeddedNoteNotFound}>
			Note not found.
			{' '}
			<ExternalLink
				href={`https://www.nostr.guru/e/${id}`}
			>
				Open in Nostr Guru
			</ExternalLink>
		</div>
	);
}
