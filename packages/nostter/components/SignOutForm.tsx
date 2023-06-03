'use client';

import { useAccountsLocalStorage } from "@/hooks/useAccountsLocalStorage";
import { isNpub } from "@/nostr/Npub";
import invariant from "invariant";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useCallback, useMemo } from "react";
import { Button } from "./Button";

import styles from './SignOutForm.module.css';

export function SignOutForm() {
	const { nip19Npub: nip19NpubParam } = useParams() ?? {};

	const router = useRouter();

	const { removeAccount } = useAccountsLocalStorage();

	const npub = useMemo(() => {
		if (typeof nip19NpubParam !== 'string') {
			return;
		}

		return decodeURIComponent(nip19NpubParam);
	}, [ nip19NpubParam ]);

	const handleSignOutClick = useCallback(() => {
		invariant(isNpub(npub), 'Invalid npub %s', npub);

		removeAccount(npub);

		router.push('/');
	}, [ router, removeAccount ]);

	const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		invariant(isNpub(npub), 'Invalid npub %s', npub);

		const { removedKeys } = removeAccount(npub);

		// TODO: backup

		handleSignOutClick();
	}, [ handleSignOutClick ]);

	return (
		<form
			className={styles.signOutForm}
			onSubmit={handleSubmit}
		>
			<fieldset
				className={styles.signOutFieldset}
			>
				<h1
					className={styles.signInAccountsHeader}
				>
					Confirm sign out
				</h1>

				<Button
					onClick={handleSignOutClick}
				>
					Sign out
				</Button>

				<Button
					type="submit"
				>
					Backup and sign out
				</Button>
			</fieldset>
		</form>
	);
}
