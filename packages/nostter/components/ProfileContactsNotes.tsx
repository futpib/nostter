"use client";

import { trpcReact } from '@/clients/trpc';
import { useNow } from '@/hooks/useNow';
import { startOf } from '@/luxon';
import { EventKind } from '@/nostr/EventKind';
import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import { InfiniteEventsLoader } from './InfiniteEventsLoader';

export function ProfileContactsNotes({
	pubkey,
	now: propsNow,
}: {
	pubkey: string;
	now?: string | DateTime;
}) {
	const initialNow = useNow({ propsNow });

	const [ now, setNow ] = useState(initialNow);

	const nowRounded = useMemo(() => startOf(now, '5minutes'), [ now ]);

	const initialCursor = useMemo(() => ({
		until: nowRounded.toSeconds(),
		limit: 16,
	}), [ nowRounded ]);

	const { data } = trpcReact.nostr.eventsInfinite.useInfiniteQuery({
		kinds: [ EventKind.Contacts ],
		authors: [ pubkey ],
	}, {
		initialCursor,
	});

	const latestContactsEvent = data?.pages.at(0)?.eventSet.getLatestEvent();

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

		const contactPubkeys = Array.from(new Set(latestContactsEvent.tags.flatMap(([ tagKind, tagValue ]) => {
			if (tagKind !== 'p' || !tagValue) {
				return [];
			}

			return [ tagValue ];
		}))).sort();

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
