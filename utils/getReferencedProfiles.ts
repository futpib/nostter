import { Event, parseReferences } from "nostr-tools";
import { ProfilePointer } from "nostr-tools/lib/nip19";

export function getReferencedProfiles(event: Event) {
	const references = parseReferences(event);

	const referencedPubkeys = new Map<string, ProfilePointer>();

	const taggedPubkeys = new Set<string>();

	for (const reference of references) {
		if (reference.profile) {
			taggedPubkeys.add(reference.profile.pubkey);

			if (!referencedPubkeys.has(reference.profile.pubkey)) {
				referencedPubkeys.set(reference.profile.pubkey, reference.profile);
			}

			const profilePointer = referencedPubkeys.get(reference.profile.pubkey)!;

			const allRelays = new Set([...(profilePointer.relays ?? []), ...(reference.profile.relays ?? [])]);

			profilePointer.relays = [...allRelays];
		}
	}

	const repliedPubkeys = new Set<string>();

	for (const [ tag, pubkey, relay ] of event.tags as (undefined | string)[][]) {
		if (tag !== 'p' || !pubkey) {
			continue;
		}

		if (!taggedPubkeys.has(pubkey)) {
			repliedPubkeys.add(pubkey);
		}

		if (!referencedPubkeys.has(pubkey)) {
			referencedPubkeys.set(pubkey, { pubkey });
		}

		if (relay) {
			const profilePointer = referencedPubkeys.get(pubkey)!;

			const allRelays = new Set([...(profilePointer.relays ?? []), relay]);

			profilePointer.relays = [...allRelays];
		}
	}

	return {
		profilePointers: [ ...referencedPubkeys.values() ],
		repliedProfilePointers: [ ...repliedPubkeys.values() ].map(pubkey => referencedPubkeys.get(pubkey)!),
		taggedProfilePointers: [ ...taggedPubkeys.values() ].map(pubkey => referencedPubkeys.get(pubkey)!),
	};
}
