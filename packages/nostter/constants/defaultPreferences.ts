import { Preferences, PreferencesRelay } from "@/components/PreferencesProvider";
import { defaultRelays } from "./defaultRelays";

export const defaultPreferences: Preferences = {
	relays: defaultRelays.reduce((relays, relay) => {
		relays[relay] = {
			enabled: true,
		};

		return relays;
	}, {} as Record<string, PreferencesRelay>),
};
