import { publicUrl } from "@/environment/publicUrl";
import { Event, parseReferences } from "nostr-tools";

export function getPubkeyMetadataRequests(event: Event): string[] {
	const references = parseReferences(event);

	const referencedPubkeys = new Set([
		event.pubkey,
		...references.flatMap((reference) => reference.profile ? [ reference.profile.pubkey ] : []),
	]);

	return [...referencedPubkeys].map(pubkey => `${publicUrl}/api/pubkey/${pubkey}/metadata`);
}
