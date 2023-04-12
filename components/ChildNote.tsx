import styles from './ChildNote.module.css';
import { PubkeyMetadata } from '@/utils/renderNoteContent';
import { NoteContentImages } from './NoteContentImages';
import { NoteContentText } from './NoteContentText';
import { EventPointer, ProfilePointer } from 'nostr-tools/lib/nip19';
import { NoteContentNotes } from './NoteContentNotes';
import { ImageLink } from '@/utils/getContentImageLinks';
import { MouseEvent } from 'react';
import { CreatedAtLink } from './CreatedAtLink';
import { NoteCounters } from './NoteCounters';
import { NoteRepliedProfiles } from './NoteRepliedProfiles';
import { Image } from './Image';
import { ProfileMentionNameText } from './ProfileMentionNameText';
import { ProfileLink } from './ProfileLink';
import { Reference } from '@/utils/getNoteContentTokens';

export function ChildNote({
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
	const pubkeyMetadata = pubkeyMetadatas.get(pubkey);

	return (
		<article
			className={styles.childNote}
			onClick={onClick}
			onAuxClick={onAuxClick}
		>
			<div className={styles.avatarColumn}>
				<ProfileLink
					unstyled
					pubkey={pubkey}
				>
					<Image
						className={styles.avatar}
						src={pubkeyMetadata?.picture}
					/>
				</ProfileLink>
			</div>

			<div className={styles.contentColumn}>
				<div
					className={styles.header}
				>
					{pubkeyMetadata?.display_name && (
						<div
							className={styles.displayName}
						>
							<ProfileLink
								unstyled
								pubkey={pubkey}
							>
								{pubkeyMetadata?.display_name}
							</ProfileLink>
						</div>
					)}

					<div
						className={styles.name}
					>
						<ProfileLink
							unstyled
							pubkey={pubkey}
						>
							<ProfileMentionNameText
								pubkey={pubkey}
								pubkeyMetadatas={pubkeyMetadatas}
							/>
						</ProfileLink>
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
