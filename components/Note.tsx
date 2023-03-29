import { DateTime } from 'luxon';
import { AddressPointer, EventPointer, ProfilePointer } from 'nostr-tools/lib/nip19';
import styles from './Note.module.css';
import { ReactNode, useMemo } from 'react';
import { nip19 } from 'nostr-tools';
import Link from 'next/link';
import { PubkeyMetadata, Reference, renderNoteContent } from '@/utils/renderNoteContent';

export function Note({
	pubkey,
	content,
	references,
	createdAt,
	pubkeyMetadatas,
}: {
	pubkey: string;
	content: string;
	references: Reference[];
	createdAt: number;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
}) {
	const pubkeyMetadata = pubkeyMetadatas.get(pubkey);

	const contentChildren = useMemo(() => {
		return renderNoteContent({
			content,
			references,
			pubkeyMetadatas,
		}, {
			renderProfileReference: ({ key, profilePointer, metadata }) => (
				<Link
					key={key}
					className={styles.link}
					href={`/user/${nip19.npubEncode(profilePointer.pubkey)}`}
					target="_blank"
				>
					@{metadata.name}
				</Link>
			),
		});
	}, [content, references, pubkeyMetadatas]);

	return (
		<article
			className={styles.note}
		>
			<div
				className={styles.header}
			>
				<img
					className={styles.avatar}
					src={pubkeyMetadata?.picture}
				/>

				<div
					className={styles.names}
				>
					{pubkeyMetadata?.display_name && (
						<div
							className={styles.displayName}
						>
							{pubkeyMetadata?.display_name}
						</div>
					)}

					<div
						className={styles.name}
					>
						{pubkeyMetadata?.name ? (
							<>
								@{pubkeyMetadata.name}
							</>
						) : (
							<>
								{nip19.npubEncode(pubkey)}
							</>
						)}
					</div>
				</div>
			</div>

			<div
				className={styles.content}
			>
				{contentChildren}
			</div>

			<div
				className={styles.metadata}
			>
				<span
					className={styles.createdAt}
				>
					{DateTime.fromSeconds(createdAt).toLocaleString(DateTime.DATETIME_MED)}
				</span>
			</div>
		</article>
	);
}
