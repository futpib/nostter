"use client";

import { ReactNode, createContext } from "react";

const noop = () => {};

export type ScrollKeeperContextValue = {
	onBeforeReflow: () => void;
	onReflow: (element: HTMLElement | null) => void;
};

const defaultValue: ScrollKeeperContextValue = {
	onBeforeReflow: noop,
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
