import { BsLightningCharge } from 'react-icons/bs';
import { NoteCounter } from "./NoteCounter";
import { EventPointer } from 'nostr-tools/lib/nip19';
import { trpcReact } from '@/clients/trpc';
import { DateTime } from 'luxon';
import { useNow } from '@/hooks/useNow';
import { useMemo } from 'react';
import { startOf } from '@/luxon';
import { EventKind } from '@/nostr/EventKind';
import { decodeZapEvent } from './decodeZapEvent';
import { useIdleLoop } from '@/hooks/useIdleLoop';
import { useHeavyQueriesEnabled } from '@/hooks/useHeavyQueriesEnabled';

export function NoteZapCounter({
	noteEventPointer,
	now: propsNow,
}: {
	noteEventPointer: EventPointer;
	now?: string | DateTime;
}) {
	const { heavyQueriesEnabled } = useHeavyQueriesEnabled();

	const now = useNow({ propsNow });

	const nowRounded = useMemo(() => startOf(now, '5minutes'), [ now ]);

	const input = useMemo(() => ({
		kinds: [ EventKind.Zap ],
		referencedEventIds: [ noteEventPointer.id ],
	}), [ noteEventPointer.id ]);

	const initialCursor = useMemo(() => ({
		until: nowRounded.toSeconds(),
		limit: 64,
	}), [ nowRounded ]);

	const {
		data,
		isFetching,
		hasNextPage,
		fetchNextPage,
	} = trpcReact.nostr.eventsInfinite.useInfiniteQuery(input, {
		enabled: heavyQueriesEnabled,

		initialCursor,

		getNextPageParam(lastPage) {
			return lastPage.nextCursor;
		},
	});

	const satoshisCount = useMemo(() => {
		let satoshisCount = 0;

		for (const page of data?.pages ?? []) {
			for (const event of page.eventSet) {
				const { satoshis, complete } = decodeZapEvent(event, noteEventPointer) ?? {};

				if (satoshis && complete) {
					satoshisCount += satoshis;
				}
			}
		}

		return satoshisCount;
	}, [ data?.pages.length, noteEventPointer.id ]);

	useIdleLoop(fetchNextPage, {
		enabled: Boolean(!isFetching && hasNextPage && heavyQueriesEnabled),
	});

	return (
		<NoteCounter
			iconComponent={BsLightningCharge}
			value={satoshisCount}
		/>
	);
}
