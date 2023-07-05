import { NoteTextCounter } from "./NoteTextCounter";
import { EventPointer } from 'nostr-tools/lib/nip19';
import { useRepostNotesQuery } from "@/hooks/useRepostNotesQuery";
import { useHeavyQueriesEnabled } from "@/hooks/useHeavyQueriesEnabled";
import { useMemo } from "react";
import { EventSet } from "@/nostr/EventSet";
import { useIdleLoop } from "@/hooks/useIdleLoop";

export function NoteRepostTextCounter({
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
	} = useRepostNotesQuery({ eventPointer: noteEventPointer });

	const repostNoteEvents = useMemo(() => {
		const repostNoteEvents = new EventSet();

		for (const page of data?.pages ?? []) {
			for (const event of page.eventSet) {
				repostNoteEvents.add(event);
			}
		}

		return repostNoteEvents;
	}, [ data ]);

	useIdleLoop(fetchNextPage, {
		enabled: Boolean(!isFetching && hasNextPage && heavyQueriesEnabled),
	});

	return repostNoteEvents.size > 0 ? (
		<NoteTextCounter
			value={repostNoteEvents.size}
			label="Reposts"
		/>
	) : null;
}
