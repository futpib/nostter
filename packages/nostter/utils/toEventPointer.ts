import invariant from "invariant";
import { Event } from "nostr-tools";
import { EventPointer } from "nostr-tools/lib/nip19";

export function toEventPointer(eventLike: Partial<Event & EventPointer>): EventPointer {
	invariant(eventLike.id, "Event must have an id");

	return {
		id: eventLike.id,
		author: eventLike.pubkey ?? eventLike.author,
		relays: eventLike.relays,
	};
}
