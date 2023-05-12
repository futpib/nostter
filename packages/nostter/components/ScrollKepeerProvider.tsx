"use client";

import { ReactNode, createContext } from "react";

const noop = () => {
	debugger;
};

export type ScrollKeeperContextValue = {
	onReflow: () => void;
};

const defaultValue: ScrollKeeperContextValue = {
	onReflow: noop,
};

export const ScrollKeeperContext = createContext<ScrollKeeperContextValue>(defaultValue);

export function ScrollKeeperProvider({
	value = defaultValue,
	children,
}: {
	value?: ScrollKeeperContextValue;
	children: ReactNode;
}) {
	return (
		<ScrollKeeperContext.Provider value={value}>
			{children}
		</ScrollKeeperContext.Provider>
	);
}
