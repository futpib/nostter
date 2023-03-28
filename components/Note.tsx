
import { AddressPointer, EventPointer, ProfilePointer } from 'nostr-tools/lib/nip19';
import styles from './Note.module.css';

export type Reference = {
	text: string;
	profile?: ProfilePointer;
	event?: EventPointer;
	address?: AddressPointer;
};

export function Note({
	pubkey,
	content,
	references,
}: {
	pubkey: string;
	content: string;
	references: Reference[];
}) {
	return (
		<article
			className={styles.note}
		>
			<div
				className={styles.header}
			>
				TODO: note header {pubkey}
			</div>

			<div
				className={styles.content}
			>
				{content}
				{'\n\n'}
				TODO: note references {JSON.stringify(references, null, 2)}
			</div>
		</article>
	);
}
