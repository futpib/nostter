import { NoteTextCounter } from "./NoteTextCounter";
import { EventPointer } from 'nostr-tools/lib/nip19';
import { POSITIVE_REACTIONS } from "@/constants/positiveReactions";
import { useState } from 'react';
import { trpcReact } from "@/clients/trpc";

export function NoteLikeTextCounter({
	noteEventPointer,
}: {
	noteEventPointer: EventPointer;
}) {
	const [ positiveReactionsCount, setPositiveReactionsCount ] = useState(0);

	trpcReact.nostr.eventReactionEventsSubscription.useSubscription(noteEventPointer, {
		onData(event) {
			if (POSITIVE_REACTIONS.has(event.content)) {
				setPositiveReactionsCount(positiveReactionsCount => positiveReactionsCount + 1);
			}
		},
	});

	return positiveReactionsCount > 0 ? (
		<NoteTextCounter
			value={positiveReactionsCount}
			label="Likes"
		/>
	) : null;
}
