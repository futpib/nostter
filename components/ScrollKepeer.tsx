import React, { ReactNode, useMemo, useRef } from "react";
import { ScrollKeeperContextValue, ScrollKeeperProvider } from "./ScrollKepeerProvider";
import { isElementVisible } from "@/utils/isElementVisible";

export function ScrollKeeper({
	children,
}: {
	children: ReactNode;
}) {
	const afterChildrenRef = useRef<HTMLDivElement>(null);

	const scrollKeeperContextValue = useMemo((): ScrollKeeperContextValue => ({
		onReflow() {
			if (afterChildrenRef.current && isElementVisible(afterChildrenRef.current)) {
				afterChildrenRef.current.scrollIntoView();
			}
		},
	}), []);

	return (
		<ScrollKeeperProvider value={scrollKeeperContextValue}>
			{children}
			<div ref={afterChildrenRef} />
		</ScrollKeeperProvider>
	);
}
