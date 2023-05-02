import styles from './TimelineNote.module.css';
import { PubkeyMetadata } from '@/utils/renderNoteContent';
import { NoteContentMedias } from './NoteContentMedias';
import { NoteContentPages } from './NoteContentPages';
import { NoteContentText } from './NoteContentText';
import { EventPointer, ProfilePointer } from 'nostr-tools/lib/nip19';
import { NoteContentNotes } from './NoteContentNotes';
import { ImageLink } from '@/utils/getContentImageLinks';
import { MouseEvent, ReactNode } from 'react';
import { CreatedAtLink } from './CreatedAtLink';
import { NoteCounters } from './NoteCounters';
import { NoteRepliedProfiles } from './NoteRepliedProfiles';
import { ProfileMentionNameText } from './ProfileMentionNameText';
import { ProfileLink } from './ProfileLink';
import { Reference } from '@/utils/getNoteContentTokens';
import { SmallAvatarImage } from './SmallAvatarImage';
import classNames from 'classnames';
import { PageLink } from '@/utils/getContentPageLinks';
import { PageLinkMetadata } from './NoteContentPage';

export function TimelineNote({
	id,
	pubkey,
	content,
	references,
	repliedProfilePointers,
	createdAt,
	pubkeyMetadatas,
	contentImageLinks,
	contentVideoLinks,
	contentPageLinks,
	pageLinkMetadatas,
	contentReferencedEvents,
	onClick,
	onAuxClick,
	repostHeaderChildren,
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
	contentPageLinks: PageLink[];
	pageLinkMetadatas: Map<string, PageLinkMetadata>;
	contentReferencedEvents: EventPointer[];
	onClick?: (event: MouseEvent<HTMLElement>) => void;
	onAuxClick?: (event: MouseEvent<HTMLElement>) => void;
	repostHeaderChildren?: ReactNode;
}) {
	const pubkeyMetadata = pubkeyMetadatas.get(pubkey);

	return (
		<article
			className={classNames(
				styles.timelineNote,
				repostHeaderChildren && styles.timelineNoteWithRepostHeader,
			)}
			onClick={onClick}
			onAuxClick={onAuxClick}
		>
			{repostHeaderChildren && (
				<div
					className={styles.row}
				>
					{repostHeaderChildren}
				</div>
			)}

			<div
				className={styles.row}
			>
				<div className={styles.avatarColumn}>
					<ProfileLink
						unstyled
						pubkey={pubkey}
					>
						<SmallAvatarImage
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
							<ProfileLink
								unstyled
								pubkey={pubkey}
							>
								<div
									className={styles.displayName}
								>
									{pubkeyMetadata?.display_name}
								</div>
							</ProfileLink>
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

						{' · '}

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
						contentPageLinks={contentPageLinks}
						pageLinkMetadatas={pageLinkMetadatas}
					/>

					<NoteContentMedias
						contentImageLinks={contentImageLinks}
						contentVideoLinks={contentVideoLinks}
					/>

					<NoteContentPages
						contentPageLinks={contentPageLinks}
						pageLinkMetadatas={pageLinkMetadatas}
					/>

					<NoteContentNotes
						contentReferencedEvents={contentReferencedEvents}
					/>

					<NoteCounters
						noteEventPointer={{ id }}
					/>
				</div>
			</div>
		</article>
	);
}
