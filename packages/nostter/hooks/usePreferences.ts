import { Preferences, PreferencesContext } from "@/components/PreferencesProvider";
import { defaultPreferences } from "@/constants/defaultPreferences";
import { useContext } from "react";
import deepMerge from "deepmerge";

/**
 * @deprecated Use `usePreferencesLocalStorage` instead.
 */
export function usePreferences(): Preferences {
	const overridenPreferences = useContext(PreferencesContext);

	return deepMerge(defaultPreferences, overridenPreferences, {
		arrayMerge: (_, b) => b,
	}) as Preferences;
}
