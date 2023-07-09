import { defaultRelays } from "@/constants/defaultRelays";
import { useCallback, useMemo } from "react";
import { usePreferencesLocalStorage } from "./usePreferencesLocalStorage";

export function useRelays() {
	const {
		preferencesLocalStorage,

		setRelayPreferences: setRelayPreferencesLocalStorage,
		removeRelayPreferences: removeRelayPreferencesLocalStorage,
	} = usePreferencesLocalStorage();

	const relays = useMemo(() => {
		return {
			...Object.fromEntries(defaultRelays.map(relay => [ relay, { read: true, write: true } ])),
			...preferencesLocalStorage?.relays,
		};
	}, [
		preferencesLocalStorage?.relays,
	]);

	const setRelayPreferences = setRelayPreferencesLocalStorage;

	const removeRelayPreferences = useCallback((relayUrl: string) => {
		if (defaultRelays.includes(relayUrl)) {
			setRelayPreferences(relayUrl, { read: false, write: false });

			return;
		}

		removeRelayPreferencesLocalStorage(relayUrl);
	}, [
		removeRelayPreferencesLocalStorage,
		setRelayPreferences,
	]);

	return {
		relays,

		setRelayPreferences,
		removeRelayPreferences,
	};
}
