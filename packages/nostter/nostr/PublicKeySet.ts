import invariant from "invariant";
import { getEventHash } from "nostr-tools";
import { EventKind } from "./EventKind";

function isSortedUnique(array: string[]) {
	const sortedUnique = [ ...new Set(array) ].sort();

	return array.length === sortedUnique.length;
}

const ZERO_PUBLIC_KEY = '00'.repeat(32);

export function hashPublicKeys(publicKeys: string[]) {
	invariant(isSortedUnique(publicKeys), 'Public keys must be sorted and unique');

	return getEventHash({
		kind: EventKind.Contacts,
		created_at: 0,
		content: '',
		pubkey: ZERO_PUBLIC_KEY,
		tags: publicKeys.map(publicKey => ['p', publicKey]),
	});
}
