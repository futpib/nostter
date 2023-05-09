import { NoteTextCounter } from "./NoteTextCounter";
import { EventPointer } from 'nostr-tools/lib/nip19';
import { useState } from 'react';
import { trpcReact } from "@/clients/trpc";
import { EventKind } from "@/nostr/EventKind";
import { decodeZapEvent } from "./decodeZapEvent";

export function NoteZapTextCounter({
	noteEventPointer,
}: {
	noteEventPointer: EventPointer;
}) {
	const [ satoshis, setSatoshis ] = useState<bigint>(0n);

	trpcReact.nostr.eventsSubscription.useSubscription({
		kinds: [ EventKind.Zap ],
		referencedEventIds: [ noteEventPointer.id ],
	}, {
		onData(event) {
			const { satoshis, complete } = decodeZapEvent(event, noteEventPointer) ?? {};

			if (!satoshis || !complete) {
				return;
			}

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
