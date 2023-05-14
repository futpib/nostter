import React, { ReactNode, useEffect, useMemo, useRef } from "react";
import { ScrollKeeperContextValue, ScrollKeeperProvider } from "./ScrollKepeerProvider";

export function ScrollKeeper({
	children,
}: {
	children: ReactNode;
}) {
	const afterChildrenRef = useRef<HTMLDivElement>(null);

	const state = useMemo((): {
		isScrolling: boolean;
		userScrolledOnce: boolean;

		scrollTopBeforeReflow: number | undefined;
		childrenHeightBeforeReflow: number | undefined;

		syntheticScrollTops: Set<number>;

		animationFrame: number | undefined;
	} => ({
		isScrolling: false,
		userScrolledOnce: false,

		scrollTopBeforeReflow: undefined,
		childrenHeightBeforeReflow: undefined,

		syntheticScrollTops: new Set([ 0 ]),

		animationFrame: undefined,
	}), []);

	// All this monster does is set `isScrollingRef.current` to `true` when the user is scrolling and `false` when they're not.
	useEffect(() => {
		// Not all browser support the `scrollend` event, so we have to use a timeout to detect when the user has stopped scrolling.
		let scrollEndTimeout: number | undefined = undefined;

		const handleScroll = () => {
			if (
				state.syntheticScrollTops.has(Math.floor(window.document.documentElement.scrollTop))
				|| state.syntheticScrollTops.has(Math.ceil(window.document.documentElement.scrollTop))
			) {
				return;
			}

			state.isScrolling = true;
			state.userScrolledOnce = true;

			window.clearTimeout(scrollEndTimeout);
			scrollEndTimeout = window.setTimeout(() => {
				handleScrollEnd();
			}, 100);
		};

		const handleScrollEnd = () => {
			state.isScrolling = false;

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
		onBeforeReflow() {
			if (state.scrollTopBeforeReflow === undefined) {
				state.scrollTopBeforeReflow = window.document.documentElement.scrollTop;
			}

			if (state.childrenHeightBeforeReflow === undefined) {
				state.childrenHeightBeforeReflow = afterChildrenRef.current?.offsetTop ?? 0;
			}
		},

		onReflow(element) {
			if (state.animationFrame !== undefined) {
				window.cancelAnimationFrame(state.animationFrame);
				state.animationFrame = undefined;
			}

			state.animationFrame = window.requestAnimationFrame(() => {
				if (state.isScrolling || state.userScrolledOnce) {
					return;
				}

				if (
					state.scrollTopBeforeReflow === undefined
					|| state.childrenHeightBeforeReflow === undefined
				) {
					return;
				}

				const childrenHeightAfterReflow = (
					afterChildrenRef.current
					? afterChildrenRef.current.offsetTop
					: element
					? element.offsetHeight
					: undefined
				);

				if (childrenHeightAfterReflow === undefined) {
					return;
				}

				const addedHeight = childrenHeightAfterReflow - state.childrenHeightBeforeReflow;
				const newScrollTop = state.scrollTopBeforeReflow + addedHeight;

				if (newScrollTop === window.document.documentElement.scrollTop) {
					return;
				}

				window.document.documentElement.scrollTop = newScrollTop;

				state.scrollTopBeforeReflow = newScrollTop;
				state.childrenHeightBeforeReflow = childrenHeightAfterReflow;

				state.syntheticScrollTops.add(newScrollTop);
			});
		},
	}), []);

	return (
		<ScrollKeeperProvider value={scrollKeeperContextValue}>
			{children}
			<div ref={afterChildrenRef} />
		</ScrollKeeperProvider>
	);
}
