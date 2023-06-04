import Cookies from 'js-cookie';
import { debugExtend } from "@/utils/debugExtend";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const log = debugExtend('hooks', 'useCookieStorage');

type Stringify<T> = (value: undefined | T) => string;
type Parse<T> = (raw: string) => undefined | T;

function cookieStorageRead<T>(key: string, parse: Parse<T>): T | undefined {
	if (typeof window === 'undefined') {
		return undefined;
	}

	const raw = Cookies.get(key);

	if (!raw) {
		return undefined;
	}

	const parsed = parse(raw);

	log('cookieStorageRead', key, parsed);

	return parsed;
}

function cookieStorageWrite<T>(key: string, stringify: Stringify<T>, value: T | undefined) {
	if (typeof window === 'undefined') {
		return;
	}

	const raw = stringify(value) ?? '';

	log('cookieStorageWrite', key, value);

	Cookies.set(key, raw, {
		secure: window.location.protocol !== 'http:',
	});
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
	const [ value, setValue_ ] = useState<T | undefined>(undefined);

	useEffect(() => {
		const handleStorage = (event: LightStorageEvent) => {
			if (event.key !== key) {
				return;
			}

			if (event.writerId === id) {
				return;
			}

			setValue_(cookieStorageRead(key, parse));
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

		cookieStorageWrite(key, stringify, value);
		shouldWriteNextUpdateToStorageRef.current = false;

		for (const handler of tabStorageHandlers) {
			handler({
				writerId: id,
				key,
			});
		}
	}, [ key, stringify, value ]);

	const setValue = useCallback((value: ((oldValue: T | undefined) => T) | T | undefined) => {
		shouldWriteNextUpdateToStorageRef.current = true;
		setValue_(value);
	}, []);

	return [ value, setValue, isInitialLoading ];
}
