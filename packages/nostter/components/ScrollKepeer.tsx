import React, { ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import { ScrollKeeperContextValue, ScrollKeeperProvider } from "./ScrollKepeerProvider";
import { isElementVisible } from "@/utils/isElementVisible";

export function ScrollKeeper({
	children,
}: {
	children: ReactNode;
}) {
	const afterChildrenRef = useRef<HTMLDivElement>();
	const afterChildrenLastReflowOffsetTopRef = useRef(0);
	const expectSyntheticScrollRef = useRef(false);
	const expectSyntheticScrollEndRef = useRef(false);
	const userScrolledOnceRef = useRef(false);

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
			if (expectSyntheticScrollRef.current) {
				expectSyntheticScrollRef.current = false;
				expectSyntheticScrollEndRef.current = true;
				return;
			}

			isScrollingRef.current = true;
			userScrolledOnceRef.current = true;

			window.clearTimeout(scrollEndTimeout);
			scrollEndTimeout = window.setTimeout(() => {
				handleScrollEnd();
			}, 100);
		};

		const handleScrollEnd = () => {
			if (expectSyntheticScrollEndRef.current) {
				expectSyntheticScrollEndRef.current = false;
				return;
			}

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
			if (!afterChildrenRef.current) {
				return;
			}

			const { offsetTop } = afterChildrenRef.current;

			if (
				!isScrollingRef.current
				&& (
					!userScrolledOnceRef.current
					|| isElementVisible(afterChildrenRef.current)
				)
			) {
				expectSyntheticScrollRef.current = true;
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
