import { DateTime } from 'luxon';
import styles from './EmbeddedNote.module.css';
import { nip19 } from 'nostr-tools';
import { PubkeyMetadata, Reference } from '@/utils/renderNoteContent';
import { NoteContentImages } from './NoteContentImages';
import { NoteContentText } from './NoteContentText';
import { ImageLink } from '@/utils/getContentImageLinks';
import { MouseEvent } from 'react';

export function EmbeddedNote({
	pubkey,
	content,
	references,
	createdAt,
	pubkeyMetadatas,
	contentImageLinks,
	contentVideoLinks,
	onClick,
	onAuxClick,
}: {
	id: string;
	pubkey: string;
	content: string;
	references: Reference[];
	createdAt: number;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
	contentImageLinks: ImageLink[];
	contentVideoLinks: ImageLink[];
	onClick?: (event: MouseEvent<HTMLElement>) => void;
	onAuxClick?: (event: MouseEvent<HTMLElement>) => void;
}) {
	const pubkeyMetadata = pubkeyMetadatas.get(pubkey);

	return (
		<article
			className={styles.embeddedNote}
			onClick={onClick}
			onAuxClick={onAuxClick}
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
				contentVideoLinks={contentVideoLinks}
			/>

			<NoteContentImages
				embedded
				contentImageLinks={contentImageLinks}
				contentVideoLinks={contentVideoLinks}
			/>
		</article>
	);
}
