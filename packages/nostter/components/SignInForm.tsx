'use client';

import { FormEvent, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from './SignInForm.module.css';
import { getKeyId, getKeyNpubSync, keyFeaturesMultipleAccounts, keyFeaturesPassphrase, parseKey } from "@/nostr/Key";
import { useAccountsLocalStorage } from "@/hooks/useAccountsLocalStorage";
import invariant from "invariant";
import { useDebounce } from 'use-debounce';
import { Button } from "./Button";
import { useSignInWithExtensionForm } from "@/hooks/useSignInWithExtensionForm";

export function SignInForm() {
	const { addKey, addAccount } = useAccountsLocalStorage();

	const [ key, setKey ] = useState('');
	const [ passphrase, setPassphrase ] = useState('');

	const [ debouncedKey ] = useDebounce(key, 300);
	const [ debouncedPassphrase ] = useDebounce(passphrase, 300);

	const router = useRouter();

	const onAfterExtensionSignIn = useCallback(() => {
		router.push('/');
	}, [ router ]);

	const {
		extensionSignInDisabled,
		handleExtensionSignInClick,
	} = useSignInWithExtensionForm({
		onAfterExtensionSignIn,
	});

	const validKey = useMemo(() => {
		return parseKey(debouncedKey, debouncedPassphrase || undefined);
	}, [ debouncedKey, debouncedPassphrase ]);

	const handleKeyChange = useCallback((event: FormEvent<HTMLInputElement>) => {
		setKey(event.currentTarget.value);
	}, []);

	const handlePassphraseChange = useCallback((event: FormEvent<HTMLInputElement>) => {
		setPassphrase(event.currentTarget.value);
	}, []);

	const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		invariant(validKey, 'Key is not valid');
		invariant(validKey.type !== 'extension', 'Extension key is handled separately');

		const keyId = getKeyId(validKey);
		const npub = getKeyNpubSync(validKey, { accountIndex: 0 });

		addKey(validKey);
		addAccount(npub, keyId, { accountIndex: 0 });

		if (keyFeaturesMultipleAccounts(validKey)) {
			router.push(`/signIn/accounts/${keyId}`);
			return;
		}

		router.push('/');
	}, [ validKey, router ]);

	return (
		<form
			className={styles.signInForm}
			onSubmit={handleSubmit}
		>
			<fieldset
				className={styles.signInFieldset}
			>
				<h1
					className={styles.signInHeader}
				>
					Sign in to Nostr
				</h1>

				<Button
					disabled={extensionSignInDisabled}
					onClick={handleExtensionSignInClick}
				>
					Sign in with extension
				</Button>

				<div
					className={styles.signInHr}
				>
					<div
						className={styles.signInHrText}
					>
						or
					</div>
				</div>

				<input
					className={styles.signInInput}
					type="text"
					placeholder="Private or public key"
					value={key}
					onChange={handleKeyChange}
				/>

				{validKey && keyFeaturesPassphrase(validKey) && (
					<input
						className={styles.signInInput}
						type="password"
						placeholder="Passphrase (optional)"
						value={passphrase}
						onChange={handlePassphraseChange}
					/>
				)}

				<Button
					type="submit"
					disabled={!validKey}
				>
					Sign in
				</Button>
			</fieldset>
		</form>
	);
}
