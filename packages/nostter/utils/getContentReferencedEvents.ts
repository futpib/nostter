import { EventPointer } from "nostr-tools/lib/nip19";
import { ContentToken } from "./renderNoteContent";

export function getContentReferencedEvents(contentTokens: ContentToken[]): EventPointer[] {
	const contentReferencedEvents = contentTokens.flatMap(token => {
		if (token.type !== 'reference') {
			return [];
		}

		if (!token.reference.event) {
			return [];
		}

		return [ token.reference.event ];
	});

	return contentReferencedEvents;
}
