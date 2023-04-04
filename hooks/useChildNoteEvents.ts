import { getContentReferencedEvents } from "@/utils/getContentReferencedEvents";
import { getThread } from "@/utils/getThread";
import { renderNoteContent } from "@/utils/renderNoteContent";
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

			const { contentTokens } = renderNoteContent({
				content: descendantNoteEvent.content,
				references,
				pubkeyMetadatas: new Map(),
			});

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
	}, [ id, descendantNoteEvents ]);

	return childNoteEvents;
}
