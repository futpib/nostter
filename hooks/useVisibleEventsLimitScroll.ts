import { useEffect, useState } from "react";

export function useVisibleEventsLimitScroll({
	isLoading,
}: {
	isLoading: boolean;
}) {
	const [ visibleEventsLimit, setVisibleEventsLimit ] = useState(8);

	useEffect(() => {
		if (isLoading) {
			return;
		}

		const handleScroll = () => {
			const clientHeight = document.documentElement.clientHeight;
			const documentOverflowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
			const scrollPosition = document.documentElement.scrollTop;

			if (scrollPosition > documentOverflowHeight - clientHeight) {
				setVisibleEventsLimit((prev) => prev + 8);
			}
		};

		handleScroll();

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, [ isLoading ]);

	return {
		visibleEventsLimit,
	};
}
