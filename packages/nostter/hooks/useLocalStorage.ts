import { useCallback, useEffect, useState } from "react";

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

	return parse(raw);
}

function localStorageWrite<T>(key: string, stringify: Stringify<T>, value: T | undefined) {
	if (typeof window === 'undefined') {
		return;
	}

	const raw = stringify(value) ?? '';

	window.localStorage.setItem(key, raw);
}

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
	(value: T | undefined) => void,
] {
	const [ value, setValue_ ] = useState<T | undefined>(undefined);

	useEffect(() => {
		setValue_(localStorageRead(key, parse));
	}, []);

	useEffect(() => {
		localStorageWrite(key, stringify, value);
	}, [ value ]);

	const setValue = useCallback((value: T | undefined) => {
		setValue_(value);
	}, []);

	return [ value, setValue ];
}
