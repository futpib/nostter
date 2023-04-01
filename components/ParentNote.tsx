import { DateTime } from 'luxon';
import styles from './ParentNote.module.css';
import { nip19 } from 'nostr-tools';
import { PubkeyMetadata, Reference } from '@/utils/renderNoteContent';
import { NoteContentImages } from './NoteContentImages';
import { NoteContentText } from './NoteContentText';
import { EventPointer } from 'nostr-tools/lib/nip19';
import { NoteContentNotes } from './NoteContentNotes';
import { ImageLink } from '@/utils/getContentImageLinks';
import { useScrollKeeper } from '@/hooks/useScrollKeeper';

export function ParentNote({
	pubkey,
	content,
	references,
	createdAt,
	pubkeyMetadatas,
	contentImageLinks,
	contentVideoLinks,
	contentReferencedEvents,
}: {
	id: string;
	pubkey: string;
	content: string;
	references: Reference[];
	createdAt: number;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
	contentImageLinks: ImageLink[];
	contentVideoLinks: ImageLink[];
	contentReferencedEvents: EventPointer[];
}) {
	const { handleReflow } = useScrollKeeper();

	const pubkeyMetadata = pubkeyMetadatas.get(pubkey);

	return (
		<article
			ref={handleReflow}
			className={styles.parentNote}
		>
			<div className={styles.avatarColumn}>
				<img
					className={styles.avatar}
					src={pubkeyMetadata?.picture}
				/>

				<div
					className={styles.threadLine}
				/>
			</div>

			<div className={styles.contentColumn}>
				<div
					className={styles.header}
				>
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
					contentImageLinks={contentImageLinks}
				/>

				<NoteContentNotes
					contentReferencedEvents={contentReferencedEvents}
				/>
			</div>
		</article>
	);
}