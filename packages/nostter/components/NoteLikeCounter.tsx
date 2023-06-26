import { nip25 } from 'nostr-tools';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
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
import { usePrimaryAccountNoteLike } from '@/hooks/usePrimaryAccountNoteLike';

import styles from './NoteLikeCounter.module.css';

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

	const {
		noteLikeByPrimaryAccountEvent,
		primaryAccountReactionDeletionEvents,
	} = usePrimaryAccountNoteLike({
		reactedEventPointer: noteEventPointer,
	});

	const positiveReactionsCount = useMemo(() => {
		let positiveReactionsCount = noteLikeByPrimaryAccountEvent ? 1 : 0;

		for (const page of data?.pages ?? []) {
			for (const reactionEvent of page.eventSet) {
				if (reactionEvent.id === noteLikeByPrimaryAccountEvent?.id) {
					continue;
				}

				const deletionEvents = primaryAccountReactionDeletionEvents.filter({
					kinds: [ EventKind.EventDeletion ],
					'#e': [ reactionEvent.id ],
				});

				if (deletionEvents.size > 0) {
					continue;
				}

				const reactedEventPointer = nip25.getReactedEventPointer(reactionEvent);

				if (reactedEventPointer?.id === noteEventPointer.id && POSITIVE_REACTIONS.has(reactionEvent.content)) {
					positiveReactionsCount += 1;
				}
			}
		}

		return positiveReactionsCount;
	}, [
		data?.pages.length,
		noteLikeByPrimaryAccountEvent?.id,
		primaryAccountReactionDeletionEvents.size,
		noteEventPointer.id,
	]);

	useIdleLoop(fetchNextPage, {
		enabled: Boolean(!isFetching && hasNextPage && heavyQueriesEnabled),
	});

	return (
		<NoteCounter
			activeIconClassName={styles.activeIcon}
			active={noteLikeByPrimaryAccountEvent !== undefined}
			iconComponent={AiOutlineHeart}
			activeIconComponent={AiFillHeart}
			value={positiveReactionsCount}
		/>
	);
}
