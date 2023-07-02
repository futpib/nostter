'use client';

import { useAccounts } from '@/hooks/useAccounts';
import { usePubkeyMetadatasLoader } from '@/hooks/usePubkeyMetadatasLoader';
import { FaBars } from 'react-icons/fa';
import { HeaderAccountButtonContent } from './HeaderAccountButtonContent';
import styles from './HeaderXsAccountButton.module.css';

export function HeaderXsAccountButton() {
	const { primaryAccount, isAccountsInitialLoading } = useAccounts();

	const {
		pubkeyMetadatas,
	} = usePubkeyMetadatasLoader({
		profilePointers: primaryAccount ? [
			{
				pubkey: primaryAccount.pubkey,
			},
		] : [],
	});

	const primaryAccountPubkeyMetadata = primaryAccount ? pubkeyMetadatas.get(primaryAccount.pubkey) : undefined;

	return isAccountsInitialLoading ? null : (
		<div
			className={styles.headerXsAccountButton}
		>
			<div
				className={styles.headerXsAccountButtonContent}
			>
				{primaryAccount ? (
					<HeaderAccountButtonContent
						avatarClassName={styles.headerXsAccountButtonAvatar}
						pubkey={primaryAccount.pubkey}
						pubkeyMetadata={primaryAccountPubkeyMetadata}
					/>
				) : (
					<FaBars
						className={styles.headerXsAccountButtonIcon}
					/>
				)}
			</div>
		</div>
	);
}
