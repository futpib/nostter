import React, { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import { ScrollKeeperContextValue, ScrollKeeperProvider } from "./ScrollKepeerProvider";
import { isElementVisible } from "@/utils/isElementVisible";
import invariant from "invariant";

export function ScrollKeeper({
	children,
}: {
	children: ReactNode;
}) {
	const afterChildrenRef = useRef<HTMLDivElement>();
	const afterChildrenLastReflowOffsetTopRef = useRef(0);

	const handleAfterChildrenRef = useCallback((node: HTMLDivElement) => {
		afterChildrenRef.current = node;

		if (node) {
			afterChildrenLastReflowOffsetTopRef.current = node.offsetTop;
		}
	}, []);

	const isScrollingRef = useRef(false);

	// All this monster does is set `isScrollingRef.current` to `true` when the user is scrolling and `false` when they're not.
	useEffect(() => {
		// Not all browser support the `scrollend` event, so we have to use a timeout to detect when the user has stopped scrolling.
		let scrollEndTimeout: number | undefined = undefined;

		const handleScroll = () => {
			isScrollingRef.current = true;

			window.clearTimeout(scrollEndTimeout);
			scrollEndTimeout = window.setTimeout(() => {
				handleScrollEnd();
			}, 100);
		};

		const handleScrollEnd = () => {
			isScrollingRef.current = false;

			window.clearTimeout(scrollEndTimeout);
		};

		window.addEventListener("scroll", handleScroll);
		window.addEventListener("scrollend", handleScrollEnd);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("scrollend", handleScrollEnd);
			window.clearTimeout(scrollEndTimeout);
		};
	}, []);

	const scrollKeeperContextValue = useMemo((): ScrollKeeperContextValue => ({
		onReflow() {
			invariant(afterChildrenRef.current, "ScrollKeeper: `onReflow` was called before `afterChildrenRef` was set.");

			const { offsetTop } = afterChildrenRef.current;

			if (!isScrollingRef.current && isElementVisible(afterChildrenRef.current)) {
				window.scrollBy({
					top: offsetTop - afterChildrenLastReflowOffsetTopRef.current,
					behavior: "instant" as any,
				});
			}

			afterChildrenLastReflowOffsetTopRef.current = offsetTop;
		},
	}), []);

	return (
		<ScrollKeeperProvider value={scrollKeeperContextValue}>
			{children}
			<div ref={handleAfterChildrenRef} />
		</ScrollKeeperProvider>
	);
}
