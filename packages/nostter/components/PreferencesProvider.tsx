"use client";

import { ReactNode, createContext } from "react";
import { PartialDeep } from "type-fest";

export type PreferencesRelay = {
	enabled: boolean;
};

export type Preferences = {
	relays: Record<string, PreferencesRelay>;
};

export type PreferencesContextValue = PartialDeep<Preferences>;

export const PreferencesContext = createContext<PreferencesContextValue>({});

export function PreferencesProvider({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<PreferencesContext.Provider value={{}}>
			{children}
		</PreferencesContext.Provider>
	);
}
