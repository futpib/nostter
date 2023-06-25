"use client";

import { usePubkeyContactsLoader } from '@/hooks/usePubkeyContactsLoader';
import { EventKind } from '@/nostr/EventKind';
import { getContactsEventPublicKeys } from '@/utils/getContactsEventPublicKeys';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { InfiniteEventsLoader } from './InfiniteEventsLoader';

export function ProfileContactsNotes({
	pubkey,
	now,
}: {
	pubkey: string;
	now?: string | DateTime;
}) {
	const { latestContactsEvent } = usePubkeyContactsLoader({
		profilePointer: { pubkey },
		now,
	});

	const {
		contactPubkeys,
		contactPubkeysHash,
	} = useMemo(() => {
		if (!latestContactsEvent) {
			return {
				contactPubkeys: [],
				contactPubkeysHash: 0n,
			};
		}

		const contactPubkeys = getContactsEventPublicKeys(latestContactsEvent);

		const contactPubkeysHash = contactPubkeys.reduce((contactPubkeysHash, pubkey) => {
			const pubkeyBigInt = BigInt('0x' + pubkey);
			const pubkeyHash = (contactPubkeysHash + pubkeyBigInt) % (2n ** 16n);

			return pubkeyHash;
		}, 0n);

		return {
			contactPubkeys,
			contactPubkeysHash,
		};
	}, [ latestContactsEvent ]);

	return (
		<InfiniteEventsLoader
			key={String(contactPubkeysHash)}
			id={pubkey}
			input={{
				kinds: [ EventKind.Text, EventKind.Repost ],
				authors: contactPubkeys,
			}}
			enabled={contactPubkeys.length > 0}
			now={now}
		/>
	);
}
