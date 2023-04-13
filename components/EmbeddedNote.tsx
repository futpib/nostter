import styles from './EmbeddedNote.module.css';
import { nip19 } from 'nostr-tools';
import { PubkeyMetadata } from '@/utils/renderNoteContent';
import { NoteContentMedias } from './NoteContentMedias';
import { NoteContentText } from './NoteContentText';
import { ImageLink } from '@/utils/getContentImageLinks';
import { MouseEvent } from 'react';
import { CreatedAtLink } from './CreatedAtLink';
import { NoteRepliedProfiles } from './NoteRepliedProfiles';
import { ProfilePointer } from 'nostr-tools/lib/nip19';
import { Image } from './Image';
import { ProfileMentionNameText } from './ProfileMentionNameText';
import { ProfileLink } from './ProfileLink';
import { Reference } from '@/utils/getNoteContentTokens';

export function EmbeddedNote({
	id,
	pubkey,
	content,
	references,
	repliedProfilePointers,
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
	repliedProfilePointers: ProfilePointer[];
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
				<ProfileLink
					unstyled
					pubkey={pubkey}
				>
					<Image
						className={styles.avatar}
						src={pubkeyMetadata?.picture}
					/>
				</ProfileLink>

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

			<NoteContentMedias
				embedded
				contentImageLinks={contentImageLinks}
				contentVideoLinks={contentVideoLinks}
			/>
		</article>
	);
}
