
import { PubkeyMetadata } from '@/utils/renderNoteContent';
import styles from './AccountButtonContent.module.css';
import { Image } from './Image';
import { ProfileMentionNameText } from './ProfileMentionNameText';

export function AccountButtonContent({
	pubkey,
	pubkeyMetadata,
}: {
	pubkey: string;
	pubkeyMetadata: undefined | PubkeyMetadata;
}) {
	return (
		<>
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
		</>
	);
}
