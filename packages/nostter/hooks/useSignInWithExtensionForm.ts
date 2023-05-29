import { getKeyId, getKeyNpub } from "@/nostr/Key";
import { useCallback, useEffect, useState } from "react";
import { useAccountsLocalStorage } from "./useAccountsLocalStorage";

export function useSignInWithExtensionForm({
	onAfterExtensionSignIn,
}: {
	onAfterExtensionSignIn?: () => void;
} = {}) {
	const { addKey, addAccount } = useAccountsLocalStorage();

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

	const handleExtensionSignInClick = useCallback(async () => {
		await window.nostr?.getPublicKey();

		const validKey = {
			type: 'extension',
		} as const;

		const keyId = getKeyId(validKey);
		const npub = await getKeyNpub(validKey, { accountIndex: 0 });

		addKey(validKey);
		addAccount(npub, keyId, { accountIndex: 0 });

		onAfterExtensionSignIn?.();
	}, [ hasExtension, onAfterExtensionSignIn ]);

	return {
		extensionSignInDisabled: !hasExtension,
		handleExtensionSignInClick,
	};
}
