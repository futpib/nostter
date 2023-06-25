import { Event } from "nostr-tools";

export function getContactsEventPublicKeys(event: Event) {
	const contactPubkeys = Array.from(new Set(event.tags.flatMap(([ tagKind, tagValue ]) => {
		if (tagKind !== 'p' || !tagValue) {
			return [];
		}

		return [ tagValue ];
	}))).sort();

	return contactPubkeys;
}
