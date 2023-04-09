import styles from './Note.module.css';
import { nip19 } from 'nostr-tools';
import { PubkeyMetadata, Reference } from '@/utils/renderNoteContent';
import { NoteContentImages } from './NoteContentImages';
import { NoteContentText } from './NoteContentText';
import { EventPointer, ProfilePointer } from 'nostr-tools/lib/nip19';
import { NoteContentNotes } from './NoteContentNotes';
import { ImageLink } from '@/utils/getContentImageLinks';
import { CreatedAtLink } from './CreatedAtLink';
import { Image } from './Image';
import { NoteTextCounters } from './NoteTextCounters';
import { NoteRepliedProfiles } from './NoteRepliedProfiles';

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
				<Image
					className={styles.avatar}
					src={pubkeyMetadata?.picture}
				/>

				<div
					className={styles.names}
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
			/>

			<NoteContentImages
				contentImageLinks={contentImageLinks}
				contentVideoLinks={contentVideoLinks}
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
