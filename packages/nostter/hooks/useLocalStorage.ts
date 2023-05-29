import { debugExtend } from "@/utils/debugExtend";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const log = debugExtend('hooks', 'useLocalStorage');

type Stringify<T> = (value: undefined | T) => string;
type Parse<T> = (raw: string) => undefined | T;

function localStorageRead<T>(key: string, parse: Parse<T>): T | undefined {
	if (typeof window === 'undefined') {
		return undefined;
	}

	const raw = window.localStorage.getItem(key);

	if (!raw) {
		return undefined;
	}

	const parsed = parse(raw);

	log('localStorageRead', key, parsed);

	return parsed;
}

function localStorageWrite<T>(key: string, stringify: Stringify<T>, value: T | undefined) {
	if (typeof window === 'undefined') {
		return;
	}

	const raw = stringify(value) ?? '';

	log('localStorageWrite', key, value);

	window.localStorage.setItem(key, raw);
}

type LightStorageEvent = {
	writerId?: string;
	key: null | string;
};

const tabStorageHandlers = new Set<(event: LightStorageEvent) => void>();

export function useLocalStorage<T>({
	key,
	parse = JSON.parse,
	stringify = JSON.stringify,
}: {
	key: string;
	parse?: Parse<T>;
	stringify?: Stringify<T>;
}): [
	T | undefined,
	(value: ((oldValue: T | undefined) => T) | T | undefined) => void,
] {
	const id = useId();
	const shouldWriteNextUpdateToStorageRef = useRef(false);
	const [ value, setValue_ ] = useState<T | undefined>(undefined);

	useEffect(() => {
		const handleStorage = (event: LightStorageEvent) => {
			if (event.key !== key) {
				return;
			}

			if (event.writerId === id) {
				return;
			}

			setValue_(localStorageRead(key, parse));
		};

		window.addEventListener('storage', handleStorage);
		tabStorageHandlers.add(handleStorage);

		handleStorage({
			key,
		});

		return () => {
			window.removeEventListener('storage', handleStorage);
			tabStorageHandlers.delete(handleStorage);
		};
	}, [ key, parse ]);

	useEffect(() => {
		if (!shouldWriteNextUpdateToStorageRef.current) {
			return;
		}

		localStorageWrite(key, stringify, value);
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

	return [ value, setValue ];
}
