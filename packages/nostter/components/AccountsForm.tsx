'use client';

import { useAccounts } from "@/hooks/useAccounts";
import { usePreferencesLocalStorage } from "@/hooks/usePreferencesLocalStorage";
import { usePubkeyMetadatasLoader } from "@/hooks/usePubkeyMetadatasLoader";
import { npubEncode } from "@/utils/npubEncode";
import classNames from "classnames";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import { AccountButtonContent } from "./AccountButtonContent";
import styles from './AccountsForm.module.css';
import { ProfileAnyNameText } from "./ProfileAnyNameText";

export function AccountsForm() {
	const { accounts, primaryAccount, isAccountsInitialLoading } = useAccounts();
	const { setPrimaryAccountPubkey } = usePreferencesLocalStorage();

	useEffect(() => {
		if (isAccountsInitialLoading) {
			return;
		}

		if (accounts.length !== 0) {
			return;
		}

		redirect('/sign-in');
	}, [accounts, isAccountsInitialLoading]);

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
							displayNameClassName={styles.listItemDisplayName}
							pubkey={account.pubkey}
							pubkeyMetadata={pubkeyMetadatas.get(account.pubkey)}
						/>
					</div>

					{primaryAccount?.pubkey === account.pubkey && (
						<FaCheck
							className={styles.listItemCheck}
						/>
					)}
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
					href={`/sign-out/${npubEncode(primaryAccount.pubkey)}`}
				>
					Sign out
					{' '}
					<ProfileAnyNameText
						pubkey={primaryAccount.pubkey}
						pubkeyMetadatas={pubkeyMetadatas}
					/>
				</Link>
			)}
		</>
	);
}
