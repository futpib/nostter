import styles from './TimelineRepost.module.css';
import { NoteLoader } from './NoteLoader';
import { PubkeyMetadata } from '@/utils/renderNoteContent';
import { FaRetweet } from 'react-icons/fa';
import { ProfileLink } from './ProfileLink';
import { ProfileAnyNameText } from './ProfileAnyNameText';
import { Event } from 'nostr-tools';
import { isEvent } from '@/nostr/isEvent';
import { EventPointer } from 'nostr-tools/lib/nip19';

export function TimelineRepost({
	pubkey,
	pubkeyMetadatas,
	repostedEventPointer,
	repostedEvent,
}: {
	pubkey: string;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
	repostedEventPointer: EventPointer;
	repostedEvent: undefined | Event;
}) {
	return (
		<NoteLoader
			componentKey="TimelineNoteLink"
			eventPointer={repostedEventPointer}
			event={isEvent(repostedEvent) ? repostedEvent : undefined}
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
						pubkeyMetadatas={pubkeyMetadatas}
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
