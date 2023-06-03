
import { useAccounts } from '@/hooks/useAccounts';
import { usePubkeyMetadatasLoader } from '@/hooks/usePubkeyMetadatasLoader';
import { AccountButtonContent } from './AccountButtonContent';
import { ProfileAnyNameText } from './ProfileAnyNameText';
import styles from './HeaderAccountButtonTooltipContent.module.css';
import classNames from 'classnames';
import { forwardRef } from 'react';
import Link from 'next/link';
import { usePreferencesLocalStorage } from '@/hooks/usePreferencesLocalStorage';
import { nip19 } from 'nostr-tools';

export const HeaderAccountButtonTooltipContent = forwardRef<HTMLDivElement>(function HeaderAccountButtonTooltipContent(_: {}, ref) {
	const { accounts, primaryAccount } = useAccounts();
	const { setPrimaryAccountPubkey } = usePreferencesLocalStorage();

	const {
		pubkeyMetadatas,
	} = usePubkeyMetadatasLoader({
		profilePointers: accounts.map(account => ({
			pubkey: account.pubkey,
		})),
	});

	const createHandleAccountClick = (account: { pubkey: string }) => () => {
		setPrimaryAccountPubkey(account.pubkey);
	};

	return (
		<>
			{accounts.map(account => (
				<div
					key={account.pubkey}
					className={classNames(styles.listItem, styles.listItemAccount)}
					onClick={createHandleAccountClick(account)}
				>
					<div
						className={styles.listItemContent}
					>
						<AccountButtonContent
							pubkey={account.pubkey}
							pubkeyMetadata={pubkeyMetadatas.get(account.pubkey)}
						/>
					</div>
				</div>
			))}

			<div
				className={styles.divider}
			/>

			<Link
				className={styles.listItem}
				href="/sign-in"
			>
				Add an account
			</Link>

			{primaryAccount && (
				<Link
					className={styles.listItem}
					href={`/sign-out/${nip19.npubEncode(primaryAccount.pubkey)}`}
				>
					Sign out
					{' '}
					<ProfileAnyNameText
						pubkey={primaryAccount.pubkey}
						pubkeyMetadatas={pubkeyMetadatas}
					/>
				</Link>
			)}

			<div
				key={accounts.length}
				ref={ref}
			/>
		</>
	);
});
