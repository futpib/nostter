import styles from './TimelineRepost.module.css';
import { useMemo } from 'react';
import { NoteLoader } from './NoteLoader';
import { PubkeyMetadata } from '@/utils/renderNoteContent';
import { FaRetweet } from 'react-icons/fa';
import { ProfileLink } from './ProfileLink';
import { ProfileAnyNameText } from './ProfileAnyNameText';
import { Event } from 'nostr-tools';
import { isEvent } from '@/nostr/isEvent';

export function TimelineRepost({
	pubkey,
	content,
	pubkeyMetadatas,
}: {
	pubkey: string;
	content: string;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
}) {
	const event = useMemo(() => {
		let event: Partial<Event> | undefined;

		try {
			event = JSON.parse(content);
		} catch (error) {
			console.error(error);
		}

		return {
			id: '0'.repeat(64),
			...event,
		};
	}, [content]);

	return (
		<NoteLoader
			componentKey="TimelineNoteLink"
			eventPointer={event}
			event={isEvent(event) ? event : undefined}
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
