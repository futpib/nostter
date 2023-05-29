import invariant from "invariant";
import { Event, getSignature, getPublicKey, nip06, nip19, validateEvent } from "nostr-tools";

export type KeyHex = {
	type: 'hex';
	value: string;
};

export type KeyNsec = {
	type: 'nsec';
	value: string;
};

export type KeyNpub = {
	type: 'npub';
	value: string;
};

export type KeyMnemonic = {
	type: 'mnemonic';
	value: string;
	passphrase: undefined | string;
};

export type KeyExtension = {
	type: 'extension';
};

export type KeyFeaturesNpubSync =
	| KeyHex
	| KeyNsec
	| KeyNpub
	| KeyMnemonic
;

export type KeyFeaturesMultipleAccounts =
	| KeyMnemonic
;

export type KeyFeaturesPassphrase =
	| KeyMnemonic
;

export type Key =
	| KeyHex
	| KeyNsec
	| KeyNpub
	| KeyMnemonic
	| KeyExtension
;

declare global {
	type RelaysRecord = Record<string, { read: boolean, write: boolean }>;

	interface Window {
		nostr?: {
			getPublicKey(): string | Promise<string>;
			signEvent(event: Event): Event | Promise<Event>;
			getRelays(): RelaysRecord | Promise<RelaysRecord>;
			nip04?: {
				encrypt(pubkey: string, plaintext: string): string | Promise<string>;
				decrypt(pubkey: string, ciphertext: string): string | Promise<string>;
			};
		};
	}
}

const SAMPLE_EVENT = {
	pubkey: '0'.repeat(64),
	kind: 0,
	tags: [],
	content: '',
	created_at: 0,
};

invariant(validateEvent(SAMPLE_EVENT), 'SAMPLE_EVENT is not a valid event');

function parseKeyHex(key: string): undefined | KeyHex {
	try {
		getSignature(SAMPLE_EVENT, key);
		return {
			type: 'hex',
			value: key,
		};
	} catch (error) {
		if (error instanceof Error) {
			error.message = `Invalid hex key: ${error.message}`;
		}
		console.warn(error);
		return undefined;
	}
}

function parseKeyNsec(key: string): undefined | KeyNsec {
	let decodeResult;

	try {
		decodeResult = nip19.decode(key);
	} catch (error) {
		if (error instanceof Error) {
			error.message = `Invalid nsec key: ${error.message}`;
		}
		console.warn(error);
		return undefined;
	}

	if (decodeResult.type === 'nsec' && parseKeyHex(decodeResult.data)) {
		return {
			type: 'nsec',
			value: key,
		};
	}

	return undefined;
}

function parseKeyNpub(key: string): undefined | KeyNpub {
	let decodeResult;

	try {
		decodeResult = nip19.decode(key);
	} catch (error) {
		if (error instanceof Error) {
			error.message = `Invalid npub key: ${error.message}`;
		}
		console.warn(error);
		return undefined;
	}

	if (decodeResult.type === 'npub') {
		return {
			type: 'npub',
			value: key,
		};
	}

	return undefined;
}

function parseKeyMnemonic(key: string, passphrase: undefined | string): undefined | KeyMnemonic {
	if (!nip06.validateWords(key)) {
		return undefined;
	}

	const derivedKey = nip06.privateKeyFromSeedWords(key, passphrase, 0);

	if (parseKeyHex(derivedKey)) {
		return {
			type: 'mnemonic',
			value: key,
			passphrase,
		};
	}

	return undefined;
}

export function parseKey(key: string, passphrase: undefined | string): undefined | Key {
	if (!key.trim()) {
		return undefined;
	}

	const keyHex = parseKeyHex(key);

	if (keyHex) {
		return keyHex;
	}

	const keyNsec = parseKeyNsec(key);

	if (keyNsec) {
		return keyNsec;
	}

	const keyNpub = parseKeyNpub(key);

	if (keyNpub) {
		return keyNpub;
	}

	const keyMnemonic = parseKeyMnemonic(key, passphrase);

	if (keyMnemonic) {
		return keyMnemonic;
	}

	return undefined;
}

function getKeyHexNpub(key: KeyHex): string {
	return nip19.npubEncode(getPublicKey(key.value));
}

function getKeyNsecNpub(key: KeyNsec): string {
	return key.value;
}

function getKeyNpubNpub(key: KeyNpub): string {
	const decodeResult = nip19.decode(key.value);

	invariant(decodeResult.type === 'nsec', 'Expected nsec key');

	return nip19.npubEncode(getPublicKey(decodeResult.data));
}

export type DerivationOptions = {
	readonly accountIndex: number;
};

function getKeyMnemonicNpub(key: KeyMnemonic, derivationOptions: DerivationOptions): string {
	const privateKey = nip06.privateKeyFromSeedWords(key.value, key.passphrase, derivationOptions.accountIndex);

	return nip19.npubEncode(getPublicKey(privateKey));
}

export function keyFeaturesNpubSync(key: Key): key is KeyFeaturesNpubSync {
	return key.type !== 'extension';
}

export function getKeyNpubSync(key: KeyFeaturesNpubSync, derivationOptions: DerivationOptions): string {
	if (key.type === 'hex') {
		return getKeyHexNpub(key);
	}

	if (key.type === 'nsec') {
		return getKeyNsecNpub(key);
	}

	if (key.type === 'npub') {
		return getKeyNpubNpub(key);
	}

	if (key.type === 'mnemonic') {
		return getKeyMnemonicNpub(key, derivationOptions);
	}

	invariant(false, 'Invalid key type %s', (key as Key).type);
}

export async function getKeyNpub(key: Key, derivationOptions: DerivationOptions): Promise<string> {
	if (key.type === 'extension') {
		invariant(window.nostr, 'Nostr extension is not installed');

		const publicKey = await window.nostr.getPublicKey();
		return nip19.npubEncode(publicKey);
	}

	return getKeyNpubSync(key, derivationOptions);
}

export function getKeyId(key: Key): string {
	if (key.type === 'extension') {
		return key.type + ':';
	}

	return key.type + ':' + getKeyNpubSync(key, { accountIndex: 0 });
}

export function keyFeaturesMultipleAccounts(key: Key): key is KeyFeaturesMultipleAccounts {
	return key.type === 'mnemonic';
}

export function keyFeaturesPassphrase(key: Key): key is KeyFeaturesPassphrase {
	return key.type === 'mnemonic';
}
