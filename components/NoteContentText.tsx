import { ReactNode, useMemo } from 'react';
import Link from 'next/link';
import { nip19 } from 'nostr-tools';
import { PubkeyMetadata, Reference, renderNoteContent } from '@/utils/renderNoteContent';
import styles from './NoteContentText.module.css';
import { ImageLink } from '@/utils/getContentImageLinks';

export function NoteContentText({
	content,
	references,
	pubkeyMetadatas,
	contentImageLinks,
}: {
	content: string;
	references: Reference[];
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
	contentImageLinks: ImageLink[];
	contentVideoLinks: ImageLink[];
}) {
	const { contentChildren } = useMemo(() => {
		return renderNoteContent<ReactNode>({
			content,
			references,
			pubkeyMetadatas,
		}, {
			renderEventReference: () => '',
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
			renderLink: ({ key, link }) => contentImageLinks.some(imageLink => imageLink.url === link.href) ? null : (
				<Link
					key={key}
					className={styles.link}
					href={link.href}
					target="_blank"
					rel="noopener noreferrer"
				>
					{link.value}
				</Link>
			),
		});
	}, [content, references, pubkeyMetadatas]);

	return (
		<div
			className={styles.content}
		>
			{contentChildren}
		</div>
	);
}
