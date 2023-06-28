"use client";

import { ReactNode, useEffect, useState } from "react";

export function ScrollDirectionClassNameSetter({
	children,
}: {
	children: ReactNode;
}) {
	const [ scrollDirection, setScrollDirection ] = useState<'up' | 'down' | undefined>(undefined);

	useEffect(() => {
		let lastScrollTop = 0;

		function handleScroll() {
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

			if (scrollTop > lastScrollTop) {
				setScrollDirection('down');
			} else {
				setScrollDirection('up');
			}

			lastScrollTop = scrollTop;
		}

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	useEffect(() => {
		document.documentElement.classList.remove('scroll-direction-up', 'scroll-direction-down');

		if (scrollDirection === undefined) {
			return;
		}

		document.documentElement.classList.add(`scroll-direction-${scrollDirection}`);
	}, [ scrollDirection ]);

	return (
		<>
			{children}
		</>
	);
}
