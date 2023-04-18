'use client';

import { ProfilePointer } from "nostr-tools/lib/nip19";
import { PubkeyMetadata } from '@/utils/renderNoteContent';
import styles from './NoteRepliedProfiles.module.css';
import { Fragment } from 'react';
import { ProfileMentionNameTextLink } from "./ProfileMentionNameTextLink";

export function NoteRepliedProfiles({
	pubkey,
	repliedProfilePointers,
	pubkeyMetadatas: pubkeyMetadatas_,
}: {
	pubkey: string;
	repliedProfilePointers: ProfilePointer[];
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
}) {
	const pubkeyMetadatas = new Map(pubkeyMetadatas_);

	const links = repliedProfilePointers.flatMap(profilePointer => {
		if (profilePointer.pubkey === pubkey) {
			return [];
		}

		return [ (
			<ProfileMentionNameTextLink
				key={profilePointer.pubkey}
				pubkey={profilePointer.pubkey}
				pubkeyMetadatas={pubkeyMetadatas}
			/>
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
