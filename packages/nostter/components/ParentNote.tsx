import styles from './ParentNote.module.css';
import { PubkeyMetadata } from '@/utils/renderNoteContent';
import { NoteContentMedias } from './NoteContentMedias';
import { NoteContentPages } from './NoteContentPages';
import { NoteContentText } from './NoteContentText';
import { EventPointer, ProfilePointer } from 'nostr-tools/lib/nip19';
import { NoteContentNotes } from './NoteContentNotes';
import { ImageLink } from '@/utils/getContentImageLinks';
import { useScrollKeeper } from '@/hooks/useScrollKeeper';
import { MouseEvent } from 'react';
import { CreatedAtLink } from './CreatedAtLink';
import { NoteCounters } from './NoteCounters';
import { NoteRepliedProfiles } from './NoteRepliedProfiles';
import { ProfileMentionNameText } from './ProfileMentionNameText';
import { Reference } from '@/utils/getNoteContentTokens';
import { ProfileLink } from './ProfileLink';
import { SmallAvatarImage } from './SmallAvatarImage';
import { PageLink } from '@/utils/getContentPageLinks';
import { PageLinkMetadata } from './NoteContentPage';
import { ScrollSpyStatusProvider } from './ScrollSpyStatusProvider';

export function ParentNote({
	id,
	pubkey,
	content,
	references,
	repliedProfilePointers,
	createdAt,
	pubkeyMetadatas,
	tagsImageLinks,
	tagsVideoLinks,
	contentImageLinks,
	contentVideoLinks,
	contentPageLinks,
	pageLinkMetadatas,
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
	tagsImageLinks: ImageLink[];
	tagsVideoLinks: ImageLink[];
	contentImageLinks: ImageLink[];
	contentVideoLinks: ImageLink[];
	contentPageLinks: PageLink[];
	pageLinkMetadatas: Map<string, PageLinkMetadata>;
	contentReferencedEvents: EventPointer[];
	onClick?: (event: MouseEvent<HTMLElement>) => void;
	onAuxClick?: (event: MouseEvent<HTMLElement>) => void;
}) {
	const { handleReflow } = useScrollKeeper();

	const pubkeyMetadata = pubkeyMetadatas.get(pubkey);

	return (
		<ScrollSpyStatusProvider>
			<article
				ref={handleReflow}
				className={styles.parentNote}
				onClick={onClick}
				onAuxClick={onAuxClick}
			>
				<div className={styles.avatarColumn}>
					<ProfileLink
						unstyled
						pubkey={pubkey}
						pubkeyMetadatas={pubkeyMetadatas}
					>
						<SmallAvatarImage
							className={styles.avatar}
							src={pubkeyMetadata?.picture}
						/>
					</ProfileLink>

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
						contentPageLinks={contentPageLinks}
						pageLinkMetadatas={pageLinkMetadatas}
					/>

					<NoteContentMedias
						tagsImageLinks={tagsImageLinks}
						tagsVideoLinks={tagsVideoLinks}
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
			</article>
		</ScrollSpyStatusProvider>
	);
}
