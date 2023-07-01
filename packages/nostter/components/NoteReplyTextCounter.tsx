import { NoteTextCounter } from "./NoteTextCounter";
import { useDescendantNotesQuery } from '@/hooks/useDescendantNotesQuery';
import { EventPointer } from 'nostr-tools/lib/nip19';
import { useChildNoteEvents } from '@/hooks/useChildNoteEvents';
import { useMemo } from "react";
import { EventSet } from "@/nostr/EventSet";
import { useHeavyQueriesEnabled } from "@/hooks/useHeavyQueriesEnabled";
import { useIdleLoop } from "@/hooks/useIdleLoop";

export function NoteReplyTextCounter({
	noteEventPointer,
}: {
	noteEventPointer: EventPointer;
}) {
	const { heavyQueriesEnabled } = useHeavyQueriesEnabled();

	const {
		data,
		isFetching,
		fetchNextPage,
		hasNextPage,
	} = useDescendantNotesQuery({ eventPointer: noteEventPointer });

	const descendantNoteEvents = useMemo(() => {
		const descendantNoteEvents = new EventSet();

		for (const page of data?.pages ?? []) {
			for (const event of page.eventSet) {
				descendantNoteEvents.add(event);
			}
		}

		return descendantNoteEvents;
	}, [ data ]);

	const childNoteEvents = useChildNoteEvents({
		id: noteEventPointer.id,
		descendantNoteEvents: Array.from(descendantNoteEvents),
	});

	useIdleLoop(fetchNextPage, {
		enabled: Boolean(!isFetching && hasNextPage && heavyQueriesEnabled),
	});

	return childNoteEvents.length > 0 ? (
		<NoteTextCounter
			value={childNoteEvents.length}
			label="Replies"
		/>
	) : null;
}
