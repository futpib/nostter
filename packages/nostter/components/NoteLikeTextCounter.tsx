import { NoteTextCounter } from "./NoteTextCounter";
import { EventPointer } from 'nostr-tools/lib/nip19';
import { nip25 } from 'nostr-tools';
import { POSITIVE_REACTIONS } from "@/constants/positiveReactions";
import { useMemo, useState } from 'react';
import { trpcReact } from "@/clients/trpc";
import { EventKind } from "@/nostr/EventKind";
import { useHeavyQueriesEnabled } from "@/hooks/useHeavyQueriesEnabled";

export function NoteLikeTextCounter({
	noteEventPointer,
}: {
	noteEventPointer: EventPointer;
}) {
	const { heavyQueriesEnabled } = useHeavyQueriesEnabled();
	const seenEventIds = useMemo(() => new Set<string>(), []);

	const [ positiveReactionsCount, setPositiveReactionsCount ] = useState(0);

	trpcReact.nostr.eventsSubscription.useSubscription({
		kinds: [ EventKind.Reaction ],
		referencedEventIds: [ noteEventPointer.id ],
	}, {
		enabled: heavyQueriesEnabled,

		onData(event) {
			const reactedEventPointer = nip25.getReactedEventPointer(event);

			if (reactedEventPointer?.id !== noteEventPointer.id || !POSITIVE_REACTIONS.has(event.content)) {
				return;
			}

			if (seenEventIds.has(event.id)) {
				return;
			}

			seenEventIds.add(event.id);

			setPositiveReactionsCount(positiveReactionsCount => positiveReactionsCount + 1);
		},
	});

	return positiveReactionsCount > 0 ? (
		<NoteTextCounter
			value={positiveReactionsCount}
			label="Likes"
		/>
	) : null;
}
