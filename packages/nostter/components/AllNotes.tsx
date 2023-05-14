"use client";

import { DateTime } from 'luxon';
import { EventKind } from '@/nostr/EventKind';
import { InfiniteEventsLoader } from './InfiniteEventsLoader';

export function AllNotes({
	now,
}: {
	now?: string | DateTime;
}) {
	return (
		<InfiniteEventsLoader
			id="all-notes"
			input={{
				kinds: [ EventKind.Text ],
			}}
			now={now}
		/>
	);
}
