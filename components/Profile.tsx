import { PubkeyMetadata } from "@/utils/renderNoteContent";
import { Image } from './Image';
import styles from "./Profile.module.css";
import { ProfileMentionNameText } from "./ProfileMentionNameText";

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
					className={styles.avatarImage}
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

				<div
					className={styles.about}
				>
					{pubkeyMetadata?.about}
				</div>
			</div>
		</div>
	);
}
