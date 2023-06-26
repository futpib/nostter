"use client";

import { EventKind } from '@/nostr/EventKind';
import { EventSet, EventSetJSON } from '@/nostr/EventSet';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { InfiniteEventsLoader } from './InfiniteEventsLoader';

export function ProfileNotes({
	pubkey,
	pubkeyPreloadedEventSet: pubkeyPreloadedEventSetJSON,
	now,
}: {
	pubkey: string;
	pubkeyPreloadedEventSet?: EventSetJSON | EventSet;
	now?: string | DateTime;
}) {
	const pubkeyPreloadedEventSet = useMemo(() => {
		if (pubkeyPreloadedEventSetJSON) {
			return EventSet.fromJSON(pubkeyPreloadedEventSetJSON);
		}
	}, [pubkeyPreloadedEventSetJSON]);

	return (
		<InfiniteEventsLoader
			id={pubkey}
			input={{
				kinds: [ EventKind.Text, EventKind.Repost ],
				authors: [ pubkey ],
			}}
			pubkeyPreloadedEventSet={pubkeyPreloadedEventSet}
			now={now}
		/>
	);
}
