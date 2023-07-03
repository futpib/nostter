
import { PubkeyMetadata } from '@/utils/renderNoteContent';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import styles from './ProfileHeader.module.css';
import { ProfileMentionNameText } from './ProfileMentionNameText';
import { npubEncode } from '../utils/npubEncode';

export function ProfileHeader({
	pubkey,
	pubkeyMetadata,
}: {
	pubkey: string;
	pubkeyMetadata: undefined | PubkeyMetadata;
}) {

	return (
		<div
			className={styles.profileHeader}
		>
			<div className={styles.profileHeaderHeightPlaceholder}> </div>

			<Link
				className={styles.profileHeaderBackLink}
				href={`/${npubEncode(pubkey)}`}
			>
				<FaArrowLeft />
			</Link>

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
		</div>
	);
}
