'use client';

import { usePubkeyContactsLoader } from "@/hooks/usePubkeyContactsLoader";
import { useVisibility } from "@/hooks/useVisibility";
import { getContactsEventPublicKeys } from "@/utils/getContactsEventPublicKeys";
import { DateTime } from "luxon";
import { useEffect, useMemo, useState } from "react";
import { ProfileLoader } from "./ProfileLoader";
import styles from './ProfileFollowingList.module.css';
import { EventSet, EventSetJSON } from "@/nostr/EventSet";

export function ProfileFollowingList({
	pubkey,
	pubkeyPreloadedEventSet: pubkeyPreloadedEventSetJSON,
	now,
}: {
	pubkey: string;
	pubkeyPreloadedEventSet?: EventSetJSON | EventSet;
	now?: string | DateTime;
}) {
	const pubkeyPreloadedEventSet = useMemo(() => {
		if (pubkeyPreloadedEventSetJSON) {
			return EventSet.fromJSON(pubkeyPreloadedEventSetJSON);
		}
	}, [pubkeyPreloadedEventSetJSON]);

	const {
		isLatestContactsEventLoading,
		latestContactsEvent,
	} = usePubkeyContactsLoader({
		profilePointer: { pubkey },
		pubkeyPreloadedEventSet,
		now,
	});

	const publicKeys = useMemo(() => {
		return latestContactsEvent ? getContactsEventPublicKeys(latestContactsEvent) : [];
	}, [latestContactsEvent]);

	const {
		ref: lastProfileWrapRef,
		isVisible: isLastProfileWrapVisible,
	} = useVisibility();

	const [ visiblePublicKeysCount, setVisiblePublicKeysCount ] = useState(16);

	const visiblePublicKeys = useMemo(() => {
		return publicKeys.slice(0, visiblePublicKeysCount);
	}, [publicKeys, visiblePublicKeysCount]);

	const lastVisiblePublicKey = useMemo(() => {
		return visiblePublicKeys.at(-1);
	}, [visiblePublicKeys]);

	useEffect(() => {
		if (isLastProfileWrapVisible && visiblePublicKeysCount < publicKeys.length) {
			setVisiblePublicKeysCount((count) => count + 16);
		}
	}, [isLastProfileWrapVisible, visiblePublicKeysCount, publicKeys.length]);

	return (
		<div>
			{!isLatestContactsEventLoading && (
				<>
					{visiblePublicKeys.map((publicKey) => publicKey === lastVisiblePublicKey ? (
						<div
							key={publicKey}
							ref={lastProfileWrapRef}
							className={styles.lastProfileWrap}
						>
							<ProfileLoader
								key={publicKey}
								componentKey="ProfileListItem"
								profilePointer={{ pubkey: publicKey }}
								pubkeyPreloadedEventSet={pubkeyPreloadedEventSet}
								now={now}
							/>
						</div>
					) : (
						<ProfileLoader
							key={publicKey}
							componentKey="ProfileListItem"
							profilePointer={{ pubkey: publicKey }}
							pubkeyPreloadedEventSet={pubkeyPreloadedEventSet}
							now={now}
						/>
					))}
				</>
			)}
		</div>
	);
}
