'use client';

import { trpcReact } from '@/clients/trpc';
import { useAccountsLocalStorage } from '@/hooks/useAccountsLocalStorage';
import { getKeyNpubSync, keyFeaturesNpubSync } from '@/nostr/Key';
import invariant from 'invariant';
import { useParams, useRouter } from 'next/navigation';
import { nip19 } from 'nostr-tools';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { usePubkeyMetadatasLoader } from "@/hooks/usePubkeyMetadatasLoader";
import styles from './SignInAccountsForm.module.css';
import { DateTime } from 'luxon';
import { useNow } from '@/hooks/useNow';
import { startOf } from '@/luxon';
import { Button } from './Button';
import { AccountButtonContent } from './AccountButtonContent';
import { isNpub, isoNpub } from '@/nostr/Npub';

function npubToHex(npub: string) {
	const decodeResult = nip19.decode(npub);

	invariant(decodeResult.type === 'npub', 'Expected npub');

	return decodeResult.data;
}

export function SignInAccountsForm({
	now: propsNow,
}: {
	now?: string | DateTime;
}) {
	const { keyId: keyIdParam } = useParams() ?? {};

	const keyId = useMemo(() => {
		if (typeof keyIdParam !== 'string') {
			return;
		}

		return decodeURIComponent(keyIdParam);
	}, [ keyIdParam ]);

	const router = useRouter();

	const { accountsLocalStorage, addAccount } = useAccountsLocalStorage();

	const key = useMemo(() => {
		if (typeof keyId !== 'string') {
			return;
		}

		return accountsLocalStorage?.keys[keyId];
	}, [ accountsLocalStorage, keyId ]);

	const [ accountCount, setAccountCount ] = useState(4);

	const pubkeys = useMemo(() => {
		if (!key) {
			return [];
		}

		if (!keyFeaturesNpubSync(key)) {
			return [];
		}

		return Array.from({ length: accountCount }).map((_, accountIndex) => {
			const npub = getKeyNpubSync(key, { accountIndex });

			return npubToHex(isoNpub.unwrap(npub));
		});
	}, [ key, accountCount ]);

	const profilePointers = useMemo(() => pubkeys.map(pubkey => ({
		pubkey,
	})), [ pubkeys ]);

	const {
		pubkeyMetadatas,
	} = usePubkeyMetadatasLoader({
		profilePointers,
	});

	const now = useNow({ propsNow });
	const nowRounded = useMemo(() => startOf(now, 'minute'), [ now ]);

	const initialCursor = useMemo(() => ({
		until: nowRounded.toSeconds(),
		limit: 1,
	}), [ nowRounded ]);

	const pubkeyEventQueries = trpcReact.useQueries(t => pubkeys.map(pubkey => (
		t.nostr.eventsInfinite({
			authors: [ pubkey ],
			cursor: initialCursor,
		})
	)));

	const pubkeyHasEvents = useMemo(() => {
		return new Map<string, true>(pubkeyEventQueries.flatMap(({ data }) => {
			const event = data?.eventSet.toEvent();

			if (!event) {
				return [];
			}

			return [ [ event.pubkey, true ] ];
		}));
	}, [ pubkeyEventQueries ]);

	useEffect(() => {
		setAccountCount(pubkeyHasEvents.size + 4);
	}, [ pubkeyHasEvents.size ]);

	const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		invariant(keyId, 'Expected keyId');

		for (const pubkey of pubkeys) {
			if (!pubkeyHasEvents.get(pubkey)) {
				continue;
			}

			const npub = nip19.npubEncode(pubkey);
			const accountIndex = pubkeys.indexOf(pubkey);

			invariant(isNpub(npub), 'Invalid npub %s', npub);

			addAccount(npub, keyId, { accountIndex });
		}

		router.push('/');
	}, [ router, pubkeys, keyId ]);

	return (
		<form
			className={styles.signInAccountsForm}
			onSubmit={handleSubmit}
		>
			<fieldset
				className={styles.signInAccountsFieldset}
			>
				<h1
					className={styles.signInAccountsHeader}
				>
					Select accounts
				</h1>

				{pubkeys.map(pubkey => pubkeyHasEvents.get(pubkey) ? (
					<AccountButtonContent
						key={pubkey}
						pubkey={pubkey}
						pubkeyMetadata={pubkeyMetadatas.get(pubkey)}
					/>
				) : (
					null
				))}

				<Button
					type="submit"
					disabled={!key}
				>
					Sign in
				</Button>
			</fieldset>
		</form>
	);

}
