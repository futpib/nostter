import { NoteTextCounter } from "./NoteTextCounter";
import { EventPointer } from 'nostr-tools/lib/nip19';
import { useMemo, useState } from 'react';
import { trpcReact } from "@/clients/trpc";
import { EventKind } from "@/nostr/EventKind";
import { decodeZapEvent } from "./decodeZapEvent";
import { useHeavyQueriesEnabled } from "@/hooks/useHeavyQueriesEnabled";

export function NoteZapTextCounter({
	noteEventPointer,
}: {
	noteEventPointer: EventPointer;
}) {
	const { heavyQueriesEnabled } = useHeavyQueriesEnabled();
	const seenEventIds = useMemo(() => new Set<string>(), []);

	const [ satoshis, setSatoshis ] = useState<bigint>(0n);

	trpcReact.nostr.eventsSubscription.useSubscription({
		kinds: [ EventKind.Zap ],
		referencedEventIds: [ noteEventPointer.id ],
	}, {
		enabled: heavyQueriesEnabled,

		onData(event) {
			const { satoshis, complete } = decodeZapEvent(event, noteEventPointer) ?? {};

			if (!satoshis || !complete) {
				return;
			}

			if (seenEventIds.has(event.id)) {
				return;
			}

			seenEventIds.add(event.id);

			setSatoshis(s => s + BigInt(satoshis));
		},
	});

	return satoshis > 0n ? (
		<NoteTextCounter
			value={satoshis}
			label="Zaps"
		/>
	) : null;
}
