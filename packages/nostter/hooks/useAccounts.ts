import { nip19 } from "nostr-tools";
import { useMemo } from "react";
import { useAccountsLocalStorage } from "./useAccountsLocalStorage";

export function useAccounts() {
	const { accountsLocalStorage } = useAccountsLocalStorage();

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

	return {
		accounts,
	};
}
