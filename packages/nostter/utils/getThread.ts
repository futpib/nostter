import { Event, nip10 } from "nostr-tools";
import { EventPointer } from "nostr-tools/lib/nip19";

export function getThread(noteEvent: Event, {
	contentReferencedEvents,
}: {
	contentReferencedEvents: EventPointer[],
}) {
	const thread = nip10.parse(noteEvent);

	if (
		!thread.reply
			&& thread.root?.id
			&& contentReferencedEvents.some((event) => event.id === thread.root?.id)
	) {
		thread.root = undefined;
	}

	return thread;
}
