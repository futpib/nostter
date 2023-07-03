"use client";

import { ReactNode, createContext, useState, useMemo } from "react";

const noop = () => {};

export type DrawerXsStateContextValue = {
	isOpen: boolean;
	setIsOpen: (update: boolean | ((isOpen: boolean) => boolean)) => void;
};

const defaultValue: DrawerXsStateContextValue = {
	isOpen: false,
	setIsOpen: noop,
};

export const DrawerXsStateContext = createContext<DrawerXsStateContextValue>(defaultValue);

export function DrawerXsStateProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [ isOpen, setIsOpen ] = useState(false);

	const value = useMemo(() => ({
		isOpen,
		setIsOpen,
	}), [ isOpen, setIsOpen ]);

	return (
		<DrawerXsStateContext.Provider value={value}>
			{children}
		</DrawerXsStateContext.Provider>
	);
}
