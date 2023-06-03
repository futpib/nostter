import { DerivationOptions, getKeyId, Key } from "@/nostr/Key";
import { isoNpub, Npub } from "@/nostr/Npub";
import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

type KeyReference = {
	derivationOptions: DerivationOptions;
};

type Account = {
	keyReferences: Record<string, undefined | KeyReference>;
};

type AccountsLocalStorage = {
	keys: Record<string, undefined | Key>;
	accounts: Record<string, undefined | Account>;
};

function collectGarbageKeys(accountsLocalStorage: AccountsLocalStorage): { garbageKeys: Map<string, Key> } {
	const markedKeyIds = new Set<string>();

	for (const account of Object.values(accountsLocalStorage.accounts)) {
		for (const keyId of Object.keys(account?.keyReferences ?? {})) {
			markedKeyIds.add(keyId);
		}
	}

	const garbageKeys = new Map<string, Key>();

	for (const [ keyId, key ] of Object.entries(accountsLocalStorage.keys)) {
		if (key && !markedKeyIds.has(keyId)) {
			garbageKeys.set(keyId, key);
		}
	}

	return {
		garbageKeys,
	};
}

export function useAccountsLocalStorage() {
	const [ accountsLocalStorage, setAccountsLocalStorage ] = useLocalStorage<AccountsLocalStorage>({
		key: 'accounts',
	});

	const addKey = useCallback((key: Key) => {
		const keyId = getKeyId(key);

		setAccountsLocalStorage(accountsLocalStorage => ({
			keys: {
				...accountsLocalStorage?.keys,
				[keyId]: key,
			},
			accounts: {
				...accountsLocalStorage?.accounts,
			},
		}));
	}, [ setAccountsLocalStorage ]);

	const addAccount = useCallback((npub: Npub, keyId: string, derivationOptions: DerivationOptions) => {
		setAccountsLocalStorage(accountsLocalStorage => ({
			keys: {
				...accountsLocalStorage?.keys,
			},
			accounts: {
				...accountsLocalStorage?.accounts,
				[isoNpub.unwrap(npub)]: {
					keyReferences: {
						...accountsLocalStorage?.accounts?.[keyId]?.keyReferences,
						[keyId]: {
							derivationOptions,
						},
					},
				},
			},
		}));
	}, [ setAccountsLocalStorage ]);

	const removeAccount = useCallback((npubToRemove: Npub) => {
		debugger;
		const newAccounts = Object.fromEntries(
			Object.entries(accountsLocalStorage?.accounts ?? {})
				.filter(([ npub, value ]) => value && npub !== isoNpub.unwrap(npubToRemove)),
		);

		const newAccountsLocalStorageWithGarbageKeys = {
			keys: {
				...accountsLocalStorage?.keys,
			},
			accounts: newAccounts,
		};

		const { garbageKeys } = collectGarbageKeys(newAccountsLocalStorageWithGarbageKeys);

		setAccountsLocalStorage(accountsLocalStorage => ({
			keys: Object.fromEntries(
				Object.entries(accountsLocalStorage?.keys ?? {})
					.filter(([ keyId ]) => !garbageKeys.has(keyId)),
			),
			accounts: newAccounts,
		}));

		return { removedKeys: [...garbageKeys.values()] };
	}, [ accountsLocalStorage, setAccountsLocalStorage ]);

	return {
		accountsLocalStorage,

		addKey,
		addAccount,
		removeAccount,
	};
}
