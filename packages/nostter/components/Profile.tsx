import { PubkeyMetadata } from "@/utils/renderNoteContent";
import { Image } from './Image';
import styles from "./Profile.module.css";
import { ProfileMentionNameText } from "./ProfileMentionNameText";
import { ProfileAboutText } from "./ProfileAboutText";
import { ProfileTabs } from "./ProfileTabs";

export function Profile({
	pubkey,
	pubkeyMetadata,
}: {
	pubkey: string;
	pubkeyMetadata: undefined | PubkeyMetadata;
}) {
	return (
		<div className={styles.profileMetadata}>
			<Image
				className={styles.bannerImage}
				src={pubkeyMetadata?.banner}
			/>

			<div className={styles.profileInfo}>
				<Image
					className={styles.avatar}
					src={pubkeyMetadata?.picture}
				/>

				<div className={styles.names}>
					<div
						className={styles.displayName}
					>
						{pubkeyMetadata?.display_name}
					</div>

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
			</div>

			{/* <ProfileTabs /> */}
		</div>
	);
}
