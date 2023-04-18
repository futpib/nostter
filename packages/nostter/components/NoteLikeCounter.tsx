import { FaRegHeart } from 'react-icons/fa';
import { NoteCounter } from "./NoteCounter";
import { EventPointer } from 'nostr-tools/lib/nip19';
import { useReactionsQuery } from '@/hooks/useReactionsQuery';
import { POSITIVE_REACTIONS } from "@/constants/positiveReactions";
import { useMemo } from 'react';

export function NoteLikeCounter({
	noteEventPointer,
}: {
	noteEventPointer: EventPointer;
}) {
	const reactionsQuery = useReactionsQuery({ eventPointer: noteEventPointer });

	const likeReactionsCount = useMemo(() => {
		return (reactionsQuery.data?.events ?? []).reduce((likeCount, event) => {
			if (POSITIVE_REACTIONS.has(event.content)) {
				return likeCount + 1;
			}

			return likeCount;
		}, 0);
	}, [reactionsQuery.data?.events]);

	return (
		<NoteCounter
			iconComponent={FaRegHeart}
			value={likeReactionsCount}
		/>
	);
}
