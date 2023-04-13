import { PubkeyMetadata } from "@/utils/renderNoteContent";
import { Image } from "./Image";
import styles from "./ProfileTooltipContent.module.css";
import { ProfileMentionNameText } from "./ProfileMentionNameText";
import { ProfileAboutText } from "./ProfileAboutText";

export function ProfileTooltipContent({
	pubkey,
	pubkeyMetadata,
}: {
	pubkey: string;
	pubkeyMetadata: undefined | PubkeyMetadata;
}) {
	return (
		<>
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

			<ProfileAboutText
				className={styles.about}
				content={pubkeyMetadata?.about ?? ''}
			/>
		</>
	);
}
