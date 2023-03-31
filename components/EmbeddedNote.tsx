import { DateTime } from 'luxon';
import styles from './EmbeddedNote.module.css';
import { nip19 } from 'nostr-tools';
import { PubkeyMetadata, Reference } from '@/utils/renderNoteContent';
import { NoteContentImages } from './NoteContentImages';
import { NoteContentText } from './NoteContentText';

export function EmbeddedNote({
	pubkey,
	content,
	references,
	createdAt,
	pubkeyMetadatas,
	contentImageLinks,
}: {
	pubkey: string;
	content: string;
	references: Reference[];
	createdAt: number;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
	contentImageLinks: string[];
}) {
	const pubkeyMetadata = pubkeyMetadatas.get(pubkey);

	return (
		<article
			className={styles.embeddedNote}
		>
			<div
				className={styles.header}
			>
				<img
					className={styles.avatar}
					src={pubkeyMetadata?.picture}
				/>

				{pubkeyMetadata?.display_name && (
					<div
						className={styles.displayName}
					>
						{pubkeyMetadata?.display_name}
					</div>
				)}

				<div
					className={styles.name}
				>
					{pubkeyMetadata?.name ? (
						<>
							@{pubkeyMetadata.name}
						</>
					) : (
						<>
							{nip19.npubEncode(pubkey)}
						</>
					)}
				</div>

				<span
					className={styles.createdAt}
				>
					{DateTime.fromSeconds(createdAt).toLocaleString(DateTime.DATETIME_MED)}
				</span>
			</div>

			<NoteContentText
				content={content}
				references={references}
				pubkeyMetadatas={pubkeyMetadatas}
				contentImageLinks={contentImageLinks}
			/>

			<NoteContentImages
				contentImageLinks={contentImageLinks}
			/>
		</article>
	);
}
