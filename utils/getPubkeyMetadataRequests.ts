import { Event } from "nostr-tools";
import { getPublicRuntimeConfig } from "./getPublicRuntimeConfig";
import { getReferencedProfiles } from "./getReferencedProfiles";

export function getPubkeyMetadataRequests(event: Event): string[] {
	const { profilePointers } = getReferencedProfiles(event);

	const referencedPubkeys = new Map<string, string[]>();

	referencedPubkeys.set(event.pubkey, []);

	for (const profilePointer of profilePointers) {
		referencedPubkeys.set(profilePointer.pubkey, profilePointer.relays ?? []);
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
