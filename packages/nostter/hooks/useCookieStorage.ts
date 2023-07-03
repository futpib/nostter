import Cookies from 'js-cookie';
import { debugExtend } from "@/utils/debugExtend";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const log = debugExtend('hooks', 'useCookieStorage');

type Stringify<T> = (value: undefined | T) => string;
type Parse<T> = (raw: string) => undefined | T;

const cookies = new class CookiesCached {
	private readonly cache = new Map<string, string | undefined>();

	get(key: string) {
		if (!this.cache.has(key)) {
			this.cache.set(key, Cookies.get(key));
		}

		return this.cache.get(key);
	}

	set(key: string, value: string, options?: Cookies.CookieAttributes) {
		this.cache.set(key, value);

		Cookies.set(key, value, options);
	}
}

function cookieStorageRead<T>(key: string, parse: Parse<T>): {
	raw: string | undefined;
	parsed: T | undefined;
} {
	if (typeof window === 'undefined') {
		return {
			raw: undefined,
			parsed: undefined,
		};
	}

	const raw = cookies.get(key);

	if (!raw) {
		return {
			raw: undefined,
			parsed: undefined,
		};
	}

	const parsed = parse(raw);

	log('cookieStorageRead', key, parsed);

	return { raw, parsed };
}

function cookieStorageWrite<T>(key: string, stringify: Stringify<T>, value: T | undefined) {
	if (typeof window === 'undefined') {
		return {
			raw: undefined,
			parsed: undefined,
		};
	}

	const raw = stringify(value) ?? '';

	log('cookieStorageWrite', key, value);

	cookies.set(key, raw, {
		secure: window.location.protocol !== 'http:',
	});

	return { raw, parsed: value };
}

type LightStorageEvent = {
	writerId?: string;
	key: null | string;
};

const tabStorageHandlers = new Set<(event: LightStorageEvent) => void>();

export function useCookieStorage<T>({
	key,
	parse,
	stringify,
}: {
	key: string;
	parse: Parse<T>;
	stringify: Stringify<T>;
}): [
	value: T | undefined,
	setValue: (value: ((oldValue: T | undefined) => T) | T | undefined) => void,
	isInitialLoading: boolean,
] {
	const id = useId();
	const shouldWriteNextUpdateToStorageRef = useRef(false);
	const [ isInitialLoading, setIsInitialLoading ] = useState(true);

	const lastValueRawRef = useRef<string | undefined>(undefined);
	const [ value, setValue_ ] = useState<T | undefined>(undefined);

	useEffect(() => {
		const handleStorage = (event: LightStorageEvent) => {
			if (event.key !== key) {
				return;
			}

			if (event.writerId === id) {
				return;
			}

			const { raw, parsed } = cookieStorageRead(key, parse);

			if (raw !== lastValueRawRef.current) {
				lastValueRawRef.current = raw;
				setValue_(parsed);
			}

			setIsInitialLoading(false);
		};

		tabStorageHandlers.add(handleStorage);

		handleStorage({
			key,
		});

		return () => {
			tabStorageHandlers.delete(handleStorage);
		};
	}, [ key, parse ]);

	useEffect(() => {
		if (!shouldWriteNextUpdateToStorageRef.current) {
			return;
		}

		const { raw } = cookieStorageWrite(key, stringify, value);
		shouldWriteNextUpdateToStorageRef.current = false;
		lastValueRawRef.current = raw;

		for (const handler of tabStorageHandlers) {
			handler({
				writerId: id,
				key,
			});
		}
	}, [ key, stringify, value ]);

	const setValue = useCallback((value: ((oldValue: T | undefined) => T) | T | undefined) => {
		shouldWriteNextUpdateToStorageRef.current = true;
		lastValueRawRef.current = undefined;
		setValue_(value);
	}, []);

	return [ value, setValue, isInitialLoading ];
}
