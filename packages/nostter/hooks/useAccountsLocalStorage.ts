import { DerivationOptions, getKeyId, Key } from "@/nostr/Key";
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

	const addAccount = useCallback((npub: string, keyId: string, derivationOptions: DerivationOptions) => {
		setAccountsLocalStorage(accountsLocalStorage => ({
			keys: {
				...accountsLocalStorage?.keys,
			},
			accounts: {
				...accountsLocalStorage?.accounts,
				[npub]: {
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

	return {
		accountsLocalStorage,

		addKey,
		addAccount,
	};
}
