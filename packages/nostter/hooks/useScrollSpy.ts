import { useEffect, useRef, useState } from "react";
import { debounce } from 'lodash';

const globalScrollSpy = new class GlobalScrollSpy {
	private listeners = new Set<(event: Event) => void>();

	handleScroll = debounce((event: Event) => {
		for (const listener of this.listeners) {
			listener(event);
		}
	}, 300);

	addEventListener(f: (event: Event) => void) {
		if (this.listeners.size === 0) {
			window.addEventListener('scroll', this.handleScroll);
		}

		this.listeners.add(f);
	}

	removeEventListener(f: (event: Event) => void) {
		this.listeners.delete(f);

		if (this.listeners.size === 0) {
			window.removeEventListener('scroll', this.handleScroll);
		}
	}
}

export type ScrollStatus =
	| 'VISIBLE'
	| 'OVERSCAN'
	| 'HIDDEN'
;

export function useScrollSpy() {
	const ref = useRef<HTMLElement>(null);
	const [ scrollStatus, setScrollStatus ] = useState<undefined | ScrollStatus>(undefined);

	useEffect(() => {
		const listener = debounce(() => {
			if (!ref.current) {
				setScrollStatus(undefined);
				return;
			}

			const { top, bottom } = ref.current.getBoundingClientRect();
			const { innerHeight } = window;

			const visibleTop = 0;
			const visibleBottom = innerHeight;

			const overscanTop = - innerHeight;
			const overscanBottom = innerHeight * 2;

			if (bottom >= visibleTop && top <= visibleBottom) {
				setScrollStatus('VISIBLE');
			} else if (bottom >= overscanTop && top <= overscanBottom) {
				setScrollStatus('OVERSCAN');
			} else {
				setScrollStatus('HIDDEN');
			}
		}, 300);

		globalScrollSpy.addEventListener(listener);

		listener();

		const timeout = setTimeout(() => {
			listener();
		}, 1000);

		return () => {
			globalScrollSpy.removeEventListener(listener);
			clearTimeout(timeout);
		}
	}, []);

	return {
		ref,
		scrollStatus,
	};
}
