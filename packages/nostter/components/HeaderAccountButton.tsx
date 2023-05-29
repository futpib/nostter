'use client';

import { useAccounts } from '@/hooks/useAccounts';
import { usePubkeyMetadatasLoader } from '@/hooks/usePubkeyMetadatasLoader';
import { AccountButtonContent } from './AccountButtonContent';
import styles from './HeaderAccountButton.module.css';

export function HeaderAccountButton() {
	const { accounts } = useAccounts();

	console.log({ accounts });

	const primaryAccount = accounts.at(0);

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

	return (
		<div
			className={styles.headerAccountButton}
		>
			{primaryAccount && (
				<AccountButtonContent
					pubkey={primaryAccount.pubkey}
					pubkeyMetadata={primaryAccountPubkeyMetadata}
				/>
			)}
		</div>
	);
}
