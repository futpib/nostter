import { Event, parseReferences } from "nostr-tools";
import { getPublicRuntimeConfig } from "./getPublicRuntimeConfig";

export function getPubkeyMetadataRequests(event: Event): string[] {
	const references = parseReferences(event);

	const referencedPubkeys = new Map<string, string[]>();

	referencedPubkeys.set(event.pubkey, []);

	for (const reference of references) {
		if (reference.profile) {
			referencedPubkeys.set(reference.profile.pubkey, reference.profile.relays ?? []);
		}
	}

	const { publicUrl } = getPublicRuntimeConfig();

	return [...referencedPubkeys.entries()].map(([ pubkey, relays ]) => {
		const url = new URL(`${publicUrl}/api/pubkey/${pubkey}/metadata`);

		for (const relay of relays) {
			url.searchParams.append('relays', relay);
		}

		return url.toString();
	});
}
