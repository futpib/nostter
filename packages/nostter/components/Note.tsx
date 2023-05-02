import styles from './Note.module.css';
import { PubkeyMetadata } from '@/utils/renderNoteContent';
import { NoteContentMedias } from './NoteContentMedias';
import { NoteContentText } from './NoteContentText';
import { EventPointer, ProfilePointer } from 'nostr-tools/lib/nip19';
import { NoteContentNotes } from './NoteContentNotes';
import { ImageLink } from '@/utils/getContentImageLinks';
import { CreatedAtLink } from './CreatedAtLink';
import { NoteTextCounters } from './NoteTextCounters';
import { NoteRepliedProfiles } from './NoteRepliedProfiles';
import { ProfileMentionNameText } from './ProfileMentionNameText';
import { ProfileLink } from './ProfileLink';
import { Reference } from '@/utils/getNoteContentTokens';
import { SmallAvatarImage } from './SmallAvatarImage';
import { PageLink } from '@/utils/getContentPageLinks';
import { NoteContentPages } from './NoteContentPages';
import { PageLinkMetadata } from './NoteContentPage';

export function Note({
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
}) {
	const pubkeyMetadata = pubkeyMetadatas.get(pubkey);

	return (
		<article
			className={styles.note}
		>
			<div
				className={styles.header}
			>
				<ProfileLink
					unstyled
					pubkey={pubkey}
				>
					<SmallAvatarImage
						className={styles.avatar}
						src={pubkeyMetadata?.picture}
					/>
				</ProfileLink>

				<div
					className={styles.names}
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
				</div>
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

			<div
				className={styles.metadata}
			>
				<CreatedAtLink
					long
					id={id}
					createdAt={createdAt}
				/>
			</div>

			<NoteTextCounters
				noteEventPointer={{
					id,
				}}
			/>
		</article>
	);
}
