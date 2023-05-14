"use client";

import { EventKind } from '@/nostr/EventKind';
import { parseSearch } from '@/utils/parseSearch';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { InfiniteEventsLoader } from './InfiniteEventsLoader';

export function SearchNotes({
	query,
	now,
}: {
	query: string;
	now?: string | DateTime;
}) {
	const { referencedHashtags } = useMemo(() => parseSearch(query), [ query ]);

	return (
		<InfiniteEventsLoader
			id="search-notes"
			input={{
				kinds: [ EventKind.Text ],
				referencedHashtags,
			}}
			now={now}
		/>
	);
}
