import { PubkeyMetadata } from "@/utils/renderNoteContent";
import { Image } from './Image';
import styles from "./Profile.module.css";
import { ProfileMentionNameText } from "./ProfileMentionNameText";
import { ProfileAboutText } from "./ProfileAboutText";
import { ProfileContacts } from "./ProfileContacts";
import { DateTime } from "luxon";

export function Profile({
	pubkey,
	pubkeyMetadata,
	now,
}: {
	pubkey: string;
	pubkeyMetadata: undefined | PubkeyMetadata;
	now?: string | DateTime;
}) {
	return (
		<div className={styles.profileMetadata}>
			{(pubkeyMetadata?.banner || pubkeyMetadata?.picture) && (
				<Image
					className={styles.bannerImage}
					src={pubkeyMetadata?.banner}
				/>
			)}

			<div className={styles.profileInfo}>
				{pubkeyMetadata?.picture && (
					<Image
						className={styles.avatar}
						src={pubkeyMetadata?.picture}
					/>
				)}

				<div className={styles.names}>
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
						<ProfileMentionNameText
							pubkey={pubkey}
							pubkeyMetadatas={pubkeyMetadata ? new Map([[pubkey, pubkeyMetadata]]) : new Map()}
						/>
					</div>
				</div>

				<ProfileAboutText
					className={styles.about}
					content={pubkeyMetadata?.about ?? ''}
				/>

				<ProfileContacts
					pubkey={pubkey}
					now={now}
				/>
			</div>

			{/* <ProfileTabs /> */}
		</div>
	);
}
