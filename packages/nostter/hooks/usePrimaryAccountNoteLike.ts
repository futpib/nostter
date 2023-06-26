import { trpcReact } from "@/clients/trpc";
import { POSITIVE_REACTIONS } from "@/constants/positiveReactions";
import { EventKind } from "@/nostr/EventKind";
import { EventSet } from "@/nostr/EventSet";
import { nip25 } from "nostr-tools";
import { EventPointer } from "nostr-tools/lib/nip19";
import { useMemo, useState } from "react";
import { useAccounts } from "./useAccounts";
import { useHeavyQueriesEnabled } from "./useHeavyQueriesEnabled";

export function usePrimaryAccountNoteLike({
	reactedEventPointer,
}: {
	reactedEventPointer: EventPointer;
}) {
	const { heavyQueriesEnabled } = useHeavyQueriesEnabled();

	const { primaryAccount } = useAccounts();

	const [ seenEventsCount, setSeenEventsCount ] = useState(0);

	const primaryAccountReactionEvents = useMemo(() => new EventSet(), [
		primaryAccount?.pubkey,
	]);

	trpcReact.nostr.eventsSubscription.useSubscription({
		kinds: [ EventKind.Reaction ],
		authors: primaryAccount ? [ primaryAccount.pubkey ] : [],
		referencedEventIds: [ reactedEventPointer.id ],
	}, {
		enabled: Boolean(primaryAccount && heavyQueriesEnabled),
		onData(event) {
			if (event.kind === Number(EventKind.Reaction)) {
				const reactedEventPointer_ = nip25.getReactedEventPointer(event);

				if (reactedEventPointer_?.id !== reactedEventPointer.id) {
					console.warn(
						'Got reaction for irrelevant event. Actual: %o Expected: %o Reaction event: %o',
						reactedEventPointer_,
						reactedEventPointer,
						event,
					);

					return;
				}

				if (!POSITIVE_REACTIONS.has(event.content)) {
					return;
				}

				const eventWasNotSeen = primaryAccountReactionEvents.add(event);

				if (eventWasNotSeen) {
					setSeenEventsCount((seenEventsCount) => seenEventsCount + 1);
				}

				return;
			}

			console.warn('Unexpected event kind: %o', event);
		},
	});

	const primaryAccountReactionDeletionEvents = useMemo(() => new EventSet(), [
		primaryAccount?.pubkey,
	]);

	trpcReact.nostr.eventsSubscription.useSubscription({
		kinds: [ EventKind.EventDeletion ],
		authors: primaryAccount ? [ primaryAccount.pubkey ] : [],
		referencedEventIds: primaryAccountReactionEvents.getEventIds().sort(),
	}, {
		enabled: Boolean(primaryAccount && heavyQueriesEnabled),

		onData(event) {
			if (event.kind === Number(EventKind.EventDeletion)) {
				const eventWasNotSeen = primaryAccountReactionDeletionEvents.add(event);

				if (eventWasNotSeen) {
					setSeenEventsCount((seenEventsCount) => seenEventsCount + 1);
				}

				return;
			}

			console.warn('Unexpected event kind: %o', event);
		},
	});

	const noteLikeByPrimaryAccountEvent = useMemo(() => {
		if (!primaryAccount) {
			return undefined;
		}

		return primaryAccountReactionEvents.getEventsLatestFirst().find((reactionEvent) => {
			const deletionEvents = primaryAccountReactionDeletionEvents.filter({
				kinds: [ EventKind.EventDeletion ],
				authors: [ primaryAccount.pubkey ],
				'#e': [ reactionEvent.id ],
			});

			if (deletionEvents.size > 0) {
				return false;
			}

			return true;
		});
	}, [
		seenEventsCount,
		primaryAccountReactionEvents.size,
		primaryAccountReactionDeletionEvents.size,
		primaryAccount?.pubkey,
	]);

	return {
		noteLikeByPrimaryAccountEvent,
		primaryAccountReactionDeletionEvents,
	};
}
