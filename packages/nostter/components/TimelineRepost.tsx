import styles from './TimelineRepost.module.css';
import { useMemo } from 'react';
import { NoteLoader } from './NoteLoader';
import { PubkeyMetadata } from '@/utils/renderNoteContent';
import { FaRetweet } from 'react-icons/fa';
import { ProfileLink } from './ProfileLink';
import { ProfileAnyNameText } from './ProfileAnyNameText';

export function TimelineRepost({
	pubkey,
	content,
	pubkeyMetadatas,
}: {
	pubkey: string;
	content: string;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
}) {
	const event = useMemo(() => JSON.parse(content), [content]);

	return (
		<NoteLoader
			componentKey="TimelineNoteLink"
			eventPointer={event}
			event={event}
			repostHeaderChildren={(
				<>
					<div
						className={styles.timelineRepostHeaderIcon}
					>
						<FaRetweet />
					</div>

					<ProfileLink
						unstyled
						className={styles.timelineRepostHeaderLink}
						pubkey={pubkey}
					>
						<ProfileAnyNameText
							pubkey={pubkey}
							pubkeyMetadatas={pubkeyMetadatas}
						/>
						{' '}
						Reposted
					</ProfileLink>
				</>
			)}
		/>
	);
}
