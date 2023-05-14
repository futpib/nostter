import { useCallback, useEffect, useState } from "react";

function getWindowLocationHash() {
	if (typeof window === 'undefined') {
		return '';
	}

	return window.location.hash.slice(1);
}

export function useLocationHash() {
	const [hash, setHash_] = useState(getWindowLocationHash);

	useEffect(() => {
		const handler = () => {
			setHash_(getWindowLocationHash());
		};

		window.addEventListener('hashchange', handler);

		return () => {
			window.removeEventListener('hashchange', handler);
		};
	}, []);

	const setHash = useCallback((hash: string) => {
		window.location.hash = hash;
		setHash_(hash);
	}, []);

	return {
		hash,
		setHash,
	};
}
