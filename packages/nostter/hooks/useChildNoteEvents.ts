import { getContentReferencedEvents } from "@/utils/getContentReferencedEvents";
import { getNoteContentTokens } from "@/utils/getNoteContentTokens";
import { getThread } from "@/utils/getThread";
import { Event, parseReferences } from "nostr-tools";
import { useMemo } from "react";

export function useChildNoteEvents({
	id,
	descendantNoteEvents = [],
}: {
	id: undefined | string;
	descendantNoteEvents?: Event[];
}) {
	const childNoteEvents = useMemo(() => {
		return descendantNoteEvents.filter(descendantNoteEvent => {
			const references = parseReferences(descendantNoteEvent);

			const contentTokens = getNoteContentTokens(descendantNoteEvent.content, references);

			const contentReferencedEvents = getContentReferencedEvents(contentTokens);

			const descendantThread = getThread(descendantNoteEvent, {
				contentReferencedEvents,
			});

			return id && (
				descendantThread.reply?.id === id
				|| (
					!descendantThread.reply
					&& descendantThread.root?.id === id
				)
			);
		});
	}, [ id, descendantNoteEvents.length ]);

	return childNoteEvents;
}
