import { useLayoutEffect, useState } from "react";

export function useVisibility() {
	const [ isVisible, setIsVisible ] = useState<boolean | undefined>(undefined);
	const [ element, setElement ] = useState<HTMLElement | null>(null);

	const ref = (element: HTMLElement | null) => {
		setElement(element);
	};

	useLayoutEffect(() => {
		if (!element) {
			setIsVisible(undefined);
			return;
		}

		const intersectionObserver = new IntersectionObserver((entries) => {
			const [ entry ] = entries;
			const isVisible = entry.boundingClientRect.height === 0 ? undefined : entry.isIntersecting;
			setIsVisible(isVisible);
		});

		intersectionObserver.observe(element);

		return () => {
			intersectionObserver.unobserve(element);
		}
	}, [ element ]);

	return {
		ref,
		isVisible,
	};
}
