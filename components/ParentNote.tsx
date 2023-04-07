import { DateTime } from 'luxon';
import styles from './ParentNote.module.css';
import { nip19 } from 'nostr-tools';
import { PubkeyMetadata, Reference } from '@/utils/renderNoteContent';
import { NoteContentImages } from './NoteContentImages';
import { NoteContentText } from './NoteContentText';
import { EventPointer, ProfilePointer } from 'nostr-tools/lib/nip19';
import { NoteContentNotes } from './NoteContentNotes';
import { ImageLink } from '@/utils/getContentImageLinks';
import { useScrollKeeper } from '@/hooks/useScrollKeeper';
import { MouseEvent } from 'react';
import { CreatedAtLink } from './CreatedAtLink';
import { NoteCounters } from './NoteCounters';
import { NoteRepliedProfiles } from './NoteRepliedProfiles';

export function ParentNote({
	id,
	pubkey,
	content,
	references,
	repliedProfilePointers,
	createdAt,
	pubkeyMetadatas,
	contentImageLinks,
	contentVideoLinks,
	contentReferencedEvents,
	onClick,
	onAuxClick,
}: {
	id: string;
	pubkey: string;
	content: string;
	references: Reference[];
	repliedProfilePointers: ProfilePointer[];
	createdAt: number;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
	contentImageLinks: ImageLink[];
	contentVideoLinks: ImageLink[];
	contentReferencedEvents: EventPointer[];
	onClick?: (event: MouseEvent<HTMLElement>) => void;
	onAuxClick?: (event: MouseEvent<HTMLElement>) => void;
}) {
	const { handleReflow } = useScrollKeeper();

	const pubkeyMetadata = pubkeyMetadatas.get(pubkey);

	return (
		<article
			ref={handleReflow}
			className={styles.parentNote}
			onClick={onClick}
			onAuxClick={onAuxClick}
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

					<CreatedAtLink
						id={id}
						createdAt={createdAt}
					/>
				</div>

				<NoteRepliedProfiles
					pubkey={pubkey}
					repliedProfilePointers={repliedProfilePointers}
					pubkeyMetadatas={pubkeyMetadatas}
				/>

				<NoteContentText
					content={content}
					references={references}
					pubkeyMetadatas={pubkeyMetadatas}
					contentImageLinks={contentImageLinks}
					contentVideoLinks={contentVideoLinks}
				/>

				<NoteContentImages
					contentImageLinks={contentImageLinks}
					contentVideoLinks={contentVideoLinks}
				/>

				<NoteContentNotes
					contentReferencedEvents={contentReferencedEvents}
				/>

				<NoteCounters
					noteEventPointer={{ id }}
				/>
			</div>
		</article>
	);
}
