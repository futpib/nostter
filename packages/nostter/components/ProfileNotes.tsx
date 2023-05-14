"use client";

import { EventKind } from '@/nostr/EventKind';
import { DateTime } from 'luxon';
import { InfiniteEventsLoader } from './InfiniteEventsLoader';

export function ProfileNotes({
	pubkey,
	now,
}: {
	pubkey: string;
	now?: string | DateTime;
}) {
	return (
		<InfiniteEventsLoader
			id={pubkey}
			input={{
				kinds: [ EventKind.Text, EventKind.Repost ],
				authors: [ pubkey ],
			}}
			now={now}
		/>
	);
}
