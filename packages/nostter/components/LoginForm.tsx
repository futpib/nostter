'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from './LoginForm.module.css';
import { getKeyId, getKeyNpub, getKeyNpubSync, keyFeaturesMultipleAccounts, keyFeaturesPassphrase, parseKey } from "@/nostr/Key";
import { useAccountsLocalStorage } from "@/hooks/useAccountsLocalStorage";
import invariant from "invariant";
import { useDebounce } from 'use-debounce';

export function LoginForm() {
	const { addKey, addAccount } = useAccountsLocalStorage();

	const [ key, setKey ] = useState('');
	const [ passphrase, setPassphrase ] = useState('');

	const [ debouncedKey ] = useDebounce(key, 300);
	const [ debouncedPassphrase ] = useDebounce(passphrase, 300);

	const [ hasExtension, setHasExtension ] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		if (typeof window.nostr === 'undefined') {
			return;
		}

		setHasExtension(true);
	}, []);

	const validKey = useMemo(() => {
		return parseKey(debouncedKey, debouncedPassphrase || undefined);
	}, [ debouncedKey, debouncedPassphrase ]);

	const router = useRouter();

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
			router.push(`/login/accounts/${keyId}`);
			return;
		}

		router.push('/');
	}, [ validKey, router ]);

	const handleExtensionLoginClick = useCallback(async () => {
		await window.nostr?.getPublicKey();

		const validKey = {
			type: 'extension',
		} as const;

		const keyId = getKeyId(validKey);
		const npub = await getKeyNpub(validKey, { accountIndex: 0 });

		addKey(validKey);
		addAccount(npub, keyId, { accountIndex: 0 });

		router.push('/');
	}, [ hasExtension, router ]);

	return (
		<form
			className={styles.loginForm}
			onSubmit={handleSubmit}
		>
			<fieldset
				className={styles.loginFieldset}
			>
				<h1
					className={styles.loginHeader}
				>
					Login to Nostr
				</h1>

				<button
					className={styles.loginButton}
					type="button"
					disabled={!hasExtension}
					onClick={handleExtensionLoginClick}
				>
					Login with extension
				</button>

				<div
					className={styles.loginHr}
				>
					<div
						className={styles.loginHrText}
					>
						or
					</div>
				</div>

				<input
					className={styles.loginInput}
					type="text"
					placeholder="Private or public key"
					value={key}
					onChange={handleKeyChange}
				/>

				{validKey && keyFeaturesPassphrase(validKey) && (
					<input
						className={styles.loginInput}
						type="password"
						placeholder="Passphrase (optional)"
						value={passphrase}
						onChange={handlePassphraseChange}
					/>
				)}

				<button
					className={styles.loginButton}
					type="submit"
					disabled={!validKey}
				>
					Login
				</button>
			</fieldset>
		</form>
	);
}
