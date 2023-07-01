import { FaRegComment } from 'react-icons/fa';
import { NoteCounter } from "./NoteCounter";
import { EventPointer } from 'nostr-tools/lib/nip19';
import { useChildNoteEvents } from '@/hooks/useChildNoteEvents';
import { useHeavyQueriesEnabled } from '@/hooks/useHeavyQueriesEnabled';
import { useMemo } from 'react';
import { DateTime } from 'luxon';
import { EventSet } from '@/nostr/EventSet';
import { useIdleLoop } from '@/hooks/useIdleLoop';
import { useDescendantNotesQuery } from '@/hooks/useDescendantNotesQuery';

export function NoteReplyCounter({
	noteEventPointer,
	now: propsNow,
}: {
	noteEventPointer: EventPointer;
	now?: string | DateTime;
}) {
	const { heavyQueriesEnabled } = useHeavyQueriesEnabled();

	const {
		data,
		isFetching,
		hasNextPage,
		fetchNextPage,
	} = useDescendantNotesQuery({
		eventPointer: noteEventPointer,
		now: propsNow,
	}, {
		enabled: heavyQueriesEnabled,
	});

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

	return (
		<NoteCounter
			iconComponent={FaRegComment}
			value={childNoteEvents.length ?? 0}
		/>
	);
}
