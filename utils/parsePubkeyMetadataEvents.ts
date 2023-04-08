import { Event } from "nostr-tools";
import { PubkeyMetadata } from "./renderNoteContent";
import { EVENT_KIND_METADATA } from "@/constants/eventKinds";

export function parsePubkeyMetadataEvents(
	pubkeyMetadataEvents: Event[],
): Map<string, PubkeyMetadata> {
	const pubkeyMetadatas = pubkeyMetadataEvents.reduce((map, event) => {
		if (event?.kind !== EVENT_KIND_METADATA) {
			return map;
		}

		let pubkeyMetadata: PubkeyMetadata = {};

		try {
			pubkeyMetadata = event.content ? JSON.parse(event.content) : {};
		} catch (error) {
			if (error instanceof SyntaxError) {
				console.error('Failed to parse metadata event content:', event.content);
			} else {
				throw error;
			}
		}

		map.set(event.pubkey, pubkeyMetadata);

		return map;
	}, new Map<string, PubkeyMetadata>());

	return pubkeyMetadatas;
}
