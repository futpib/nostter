import { PubkeyMetadata } from "@/utils/renderNoteContent";
import styles from "./ProfileListItem.module.css";
import { ProfileMentionNameText } from "./ProfileMentionNameText";
import { ProfileAboutText } from "./ProfileAboutText";
import { DateTime } from "luxon";
import { ProfileLink } from "./ProfileLink";
import { SmallAvatarImage } from "./SmallAvatarImage";

export function ProfileListItem({
	pubkey,
	pubkeyMetadata,
	now,
}: {
	pubkey: string;
	pubkeyMetadata: undefined | PubkeyMetadata;
	now?: string | DateTime;
}) {
	return (
		<article className={styles.profileListItem}>
			<div className={styles.avatarColumn}>
				<ProfileLink
					unstyled
					pubkey={pubkey}
				>
					<SmallAvatarImage
						className={styles.avatar}
						src={pubkeyMetadata?.picture}
					/>
				</ProfileLink>
			</div>

			<div className={styles.contentColumn}>
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
			</div>
		</article>
	);
}
