import Link from 'next/link';
import { nip19 } from 'nostr-tools';
import { ProfilePointer } from "nostr-tools/lib/nip19";
import { PubkeyMetadata } from '@/utils/renderNoteContent';
import styles from './NoteRepliedProfiles.module.css';
import { Fragment, useCallback } from 'react';

export function NoteRepliedProfiles({
	pubkey,
	repliedProfilePointers,
	pubkeyMetadatas,
}: {
	pubkey: string;
	repliedProfilePointers: ProfilePointer[];
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
}) {
	const handleProfileLinkClick = useCallback((event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
		event.stopPropagation();
	}, []);

	const links = repliedProfilePointers.flatMap(profilePointer => {
		if (profilePointer.pubkey === pubkey) {
			return [];
		}

		const metadata = pubkeyMetadatas.get(profilePointer.pubkey);
		return [ (
			<Link
				key={profilePointer.pubkey}
				className={styles.link}
				href={`/${nip19.npubEncode(profilePointer.pubkey)}`}
				target="_blank"
				onClick={handleProfileLinkClick}
			>
				@{metadata?.name?.trim() || nip19.npubEncode(profilePointer.pubkey).slice(0, 12)}
			</Link>
		) ];
	})

	return links.length > 0 ? (
		<div
			className={styles.repliedProfiles}
		>
			<span>{'Replying to '}</span>

			{links.map((link, index) => (
				<Fragment key={index}>
					{index > 0 ? (
						index === links.length - 1 ? (
							<span>{' and '}</span>
						) : (
							<span>{', '}</span>
						)
					) : (
						null
					)}
					{link}
				</Fragment>
			))}
		</div>
	) : null;
}
