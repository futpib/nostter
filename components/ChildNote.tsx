import { DateTime } from 'luxon';
import styles from './ChildNote.module.css';
import { nip19 } from 'nostr-tools';
import { PubkeyMetadata, Reference } from '@/utils/renderNoteContent';
import { NoteContentImages } from './NoteContentImages';
import { NoteContentText } from './NoteContentText';
import { EventPointer } from 'nostr-tools/lib/nip19';
import { NoteContentNotes } from './NoteContentNotes';
import { ImageLink } from '@/utils/getContentImageLinks';
import { MouseEvent } from 'react';
import { CreatedAtLink } from './CreatedAtLink';
import { NoteCounters } from './NoteCounters';

export function ChildNote({
	id,
	pubkey,
	content,
	references,
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
	createdAt: number;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
	contentImageLinks: ImageLink[];
	contentVideoLinks: ImageLink[];
	contentReferencedEvents: EventPointer[];
	onClick?: (event: MouseEvent<HTMLElement>) => void;
	onAuxClick?: (event: MouseEvent<HTMLElement>) => void;
}) {
	const pubkeyMetadata = pubkeyMetadatas.get(pubkey);

	return (
		<article
			className={styles.childNote}
			onClick={onClick}
			onAuxClick={onAuxClick}
		>
			<div className={styles.avatarColumn}>
				<img
					className={styles.avatar}
					src={pubkeyMetadata?.picture}
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
