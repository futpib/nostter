'use client';

import Link from 'next/link';
import styles from './ProfileContacts.module.css';
import classNames from 'classnames';
import { nip19 } from 'nostr-tools';
import { usePubkeyContactsLoader } from '@/hooks/usePubkeyContactsLoader';
import { DateTime } from 'luxon';
import { getContactsEventPublicKeys } from '@/utils/getContactsEventPublicKeys';
import { useMemo } from 'react';

export function ProfileContacts({
	className,
	pubkey,
	now,
}: {
	className?: string;
	pubkey: string;
	now?: string | DateTime;
}) {
	const {
		isLatestContactsEventLoading,
		latestContactsEvent,
	} = usePubkeyContactsLoader({
		profilePointer: { pubkey },
		now,
	});

	const contactPublicKeys = useMemo(() => {
		return latestContactsEvent ? getContactsEventPublicKeys(latestContactsEvent) : [];
	}, [latestContactsEvent]);

	return (
		<div
			className={classNames(styles.profileContacts, className)}
		>
			{!isLatestContactsEventLoading && (
				<Link
					className={styles.profileContactsItem}
					href={`/${nip19.npubEncode(pubkey)}/following`}
				>
					<strong>{contactPublicKeys.length}</strong>
					{' '}
					Following
				</Link>
			)}

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
