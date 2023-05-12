import { nip25 } from 'nostr-tools';
import { FaRegHeart } from 'react-icons/fa';
import { NoteCounter } from "./NoteCounter";
import { EventPointer } from 'nostr-tools/lib/nip19';
import { trpcReact } from '@/clients/trpc';
import { DateTime } from 'luxon';
import { useNow } from '@/hooks/useNow';
import { useMemo } from 'react';
import { startOf } from '@/luxon';
import { EventKind } from '@/nostr/EventKind';
import { POSITIVE_REACTIONS } from '@/constants/positiveReactions';
import { useIdleLoop } from '@/hooks/useIdleLoop';
import { useHeavyQueriesEnabled } from '@/hooks/useHeavyQueriesEnabled';

export function NoteLikeCounter({
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
		kinds: [ EventKind.Reaction ],
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

	const positiveReactionsCount = useMemo(() => {
		let positiveReactionsCount = 0;

		for (const page of data?.pages ?? []) {
			for (const event of page.eventSet) {
				const reactedEventPointer = nip25.getReactedEventPointer(event);

				if (reactedEventPointer?.id === noteEventPointer.id && POSITIVE_REACTIONS.has(event.content)) {
					positiveReactionsCount += 1;
				}
			}
		}

		return positiveReactionsCount;
	}, [ data?.pages.length, noteEventPointer.id ]);

	useIdleLoop(fetchNextPage, {
		enabled: Boolean(!isFetching && hasNextPage && heavyQueriesEnabled),
	});

	return (
		<NoteCounter
			iconComponent={FaRegHeart}
			value={positiveReactionsCount}
		/>
	);
}
