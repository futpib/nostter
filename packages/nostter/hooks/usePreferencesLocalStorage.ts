import invariant from "invariant";
import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

type RelayPreferences = {
	read: boolean;
	write: boolean;
};

type PreferencesLocalStorage = {
	primaryAccountPubkey?: string;
	relays?: Record<string, RelayPreferences>;
};

function isValidRelayUrl(relayUrl: string) {
	try {
		new URL(relayUrl);
		return true;
	} catch (error) {
		console.warn(error);
		return false;
	}
}

export function usePreferencesLocalStorage() {
	const [ preferencesLocalStorage, setPreferencesLocalStorage, isPreferencesLocalStorageInitialLoading ] = useLocalStorage<PreferencesLocalStorage>({
		key: 'preferences',
	});

	const setPrimaryAccountPubkey = useCallback((primaryAccountPubkey: string) => {
		setPreferencesLocalStorage((oldPreferencesLocalStorage) => ({
			...oldPreferencesLocalStorage,
			primaryAccountPubkey,
		}));
	}, [ setPreferencesLocalStorage ]);

	const setRelayPreferences = useCallback((relayUrl: string, relayPreferences: RelayPreferences) => {
		invariant(isValidRelayUrl(relayUrl), `Invalid relay URL: ${relayUrl}`);

		setPreferencesLocalStorage((oldPreferencesLocalStorage) => ({
			...oldPreferencesLocalStorage,
			relays: {
				...oldPreferencesLocalStorage?.relays,
				[relayUrl]: relayPreferences,
			},
		}));
	}, [ setPreferencesLocalStorage ]);

	const removeRelayPreferences = useCallback((relayUrl: string) => {
		setPreferencesLocalStorage((oldPreferencesLocalStorage) => {
			const newRelays = { ...oldPreferencesLocalStorage?.relays };
			delete newRelays[relayUrl];

			return {
				...oldPreferencesLocalStorage,
				relays: newRelays,
			};
		});
	}, [ setPreferencesLocalStorage ]);

	return {
		preferencesLocalStorage,
		isPreferencesLocalStorageInitialLoading,

		setPrimaryAccountPubkey,

		setRelayPreferences,
		removeRelayPreferences,
	};
}
