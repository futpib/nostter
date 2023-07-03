'use client';

import { useAccounts } from '@/hooks/useAccounts';
import { useDrawerXsState } from '@/hooks/useDrawerXsState';
import { usePubkeyMetadatasLoader } from '@/hooks/usePubkeyMetadatasLoader';
import { useCallback } from 'react';
import { FaBars } from 'react-icons/fa';
import { HeaderAccountButtonContent } from './HeaderAccountButtonContent';
import styles from './HeaderXsAccountButton.module.css';

export function HeaderXsAccountButton() {
	const { setIsOpen } = useDrawerXsState();
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

	const handleClick = useCallback(() => {
		setIsOpen(true);
	}, [
		setIsOpen,
	]);

	const primaryAccountPubkeyMetadata = primaryAccount ? pubkeyMetadatas.get(primaryAccount.pubkey) : undefined;

	return isAccountsInitialLoading ? null : (
		<div
			className={styles.headerXsAccountButton}
			onClick={handleClick}
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
