import { nip19 } from "nostr-tools";
import { useMemo } from "react";
import { useAccountsLocalStorage } from "./useAccountsLocalStorage";
import { usePreferencesLocalStorage } from "./usePreferencesLocalStorage";

export function useAccounts() {
	const { accountsLocalStorage } = useAccountsLocalStorage();
	const { preferencesLocalStorage } = usePreferencesLocalStorage();

	const accounts = useMemo(() => Object.entries(accountsLocalStorage?.accounts ?? {}).flatMap(([ npub, account ]) => {
		const keys = Object.entries(account?.keyReferences ?? {}).flatMap(([ keyId, _keyReference ]) => {
			const key = accountsLocalStorage?.keys?.[keyId];

			if (!key) {
				return [];
			}

			return [ true ];
		});

		if (keys.length === 0) {
			return [];
		}

		const decodeResult = nip19.decode(npub);

		const pubkey = decodeResult.type === 'npub' ? decodeResult.data : undefined;

		if (!pubkey) {
			return [];
		}

		return [ { pubkey } ];
	}), [ accountsLocalStorage ]);

	const primaryAccountPubkey = preferencesLocalStorage?.primaryAccountPubkey ?? accounts.at(0)?.pubkey;
	const firstAccount = accounts.at(0);

	const primaryAccount = useMemo(() => {
		return accounts.find((account) => account.pubkey === primaryAccountPubkey) ?? firstAccount;
	}, [ accounts, primaryAccountPubkey, firstAccount?.pubkey ]);

	return {
		accounts,
		primaryAccount,
	};
}
