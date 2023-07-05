import { FaRetweet } from 'react-icons/fa';
import { NoteCounter } from "./NoteCounter";
import { EventPointer } from 'nostr-tools/lib/nip19';
import { useHeavyQueriesEnabled } from '@/hooks/useHeavyQueriesEnabled';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { useRepostNotesQuery } from '@/hooks/useRepostNotesQuery';
import { EventSet } from '@/nostr/EventSet';
import { useIdleLoop } from '@/hooks/useIdleLoop';

export function NoteRepostCounter({
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
	} = useRepostNotesQuery({
		eventPointer: noteEventPointer,
		now: propsNow,
	}, {
		enabled: heavyQueriesEnabled,
	});

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

	return (
		<NoteCounter
			iconComponent={FaRetweet}
			value={repostNoteEvents.size}
		/>
	);
}
