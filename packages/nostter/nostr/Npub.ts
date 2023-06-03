import { iso, Newtype, prism } from "newtype-ts";
import { nip19 } from "nostr-tools";

export interface Npub extends Newtype<{ readonly Npub: unique symbol }, string> {}

export function isNpub(value: unknown): value is Npub {
	try {
		return nip19.decode(value as string).type === 'npub';
	} catch {
		return false;
	}
}

export const isoNpub = iso<Npub>();
export const prismNpub = prism<Npub>(isNpub);
