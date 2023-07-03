'use client';

import Link from 'next/link';
import styles from './ProfileContacts.module.css';
import classNames from 'classnames';
import { usePubkeyContactsLoader } from '@/hooks/usePubkeyContactsLoader';
import { DateTime } from 'luxon';
import { getContactsEventPublicKeys } from '@/utils/getContactsEventPublicKeys';
import { useMemo } from 'react';
import { EventSet } from '@/nostr/EventSet';
import { npubEncode } from '../utils/npubEncode';

export function ProfileContacts({
	className,
	pubkey,
	pubkeyPreloadedEventSet,
	now,
}: {
	className?: string;
	pubkey: string;
	pubkeyPreloadedEventSet?: EventSet;
	now?: string | DateTime;
}) {
	const {
		latestContactsEvent,
	} = usePubkeyContactsLoader({
		profilePointer: { pubkey },
		pubkeyPreloadedEventSet,
		now,
	});

	const contactPublicKeys = useMemo(() => {
		return latestContactsEvent ? getContactsEventPublicKeys(latestContactsEvent) : [];
	}, [latestContactsEvent]);

	return (
		<div
			className={classNames(styles.profileContacts, className)}
		>
			<Link
				className={styles.profileContactsItem}
				href={`/${npubEncode(pubkey)}/following`}
			>
				<strong>{contactPublicKeys.length}</strong>
				{' '}
				Following
			</Link>

			{/*
				<Link
				className={styles.profileContactsItem}
				href={`/npub/${nip19.npubEncode(pubkey)}/followers`}
				>
				<strong>???</strong>
				{' '}
				Followers
				</Link> */}
		</div>
	);
}
