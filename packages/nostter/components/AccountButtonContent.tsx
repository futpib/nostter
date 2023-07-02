
import { PubkeyMetadata } from '@/utils/renderNoteContent';
import classNames from 'classnames';
import styles from './AccountButtonContent.module.css';
import { ProfileMentionNameText } from './ProfileMentionNameText';
import { SmallAvatarImage } from './SmallAvatarImage';

export function AccountButtonContent({
	avatarClassName,
	namesClassName,
	pubkey,
	pubkeyMetadata,
}: {
	avatarClassName?: string;
	namesClassName?: string;
	pubkey: string;
	pubkeyMetadata: undefined | PubkeyMetadata;
}) {
	return (
		<>
			<SmallAvatarImage
				className={classNames(styles.avatar, avatarClassName)}
				src={pubkeyMetadata?.picture}
			/>

			<div className={classNames(styles.names, namesClassName)}>
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
