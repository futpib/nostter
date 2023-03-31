import { Event, parseReferences } from "nostr-tools";
import { getPublicRuntimeConfig } from "./getPublicRuntimeConfig";

export function getPubkeyMetadataRequests(event: Event): string[] {
	const references = parseReferences(event);

	const referencedPubkeys = new Set([
		event.pubkey,
		...references.flatMap((reference) => reference.profile ? [ reference.profile.pubkey ] : []),
	]);

	const { publicUrl } = getPublicRuntimeConfig();

	return [...referencedPubkeys].map(pubkey => `${publicUrl}/api/pubkey/${pubkey}/metadata`);
}
