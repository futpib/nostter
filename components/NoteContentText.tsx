import { ReactNode, useMemo } from 'react';
import Link from 'next/link';
import { PubkeyMetadata, renderNoteContent } from '@/utils/renderNoteContent';
import styles from './NoteContentText.module.css';
import { ImageLink } from '@/utils/getContentImageLinks';
import { ProfileMentionNameTextLink } from './ProfileMentionNameTextLink';
import { Reference } from '@/utils/getNoteContentTokens';

export function NoteContentText({
	content,
	references,
	pubkeyMetadatas,
	contentImageLinks,
	contentVideoLinks,
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
		}, {
			renderEventReference: () => '',
			renderProfileReference: ({ key, profilePointer }) => (
				<ProfileMentionNameTextLink
					key={key}
					pubkey={profilePointer.pubkey}
					pubkeyMetadatas={pubkeyMetadatas}
				/>
			),
			renderLink: ({ key, link }) => (
				contentImageLinks.some(imageLink => imageLink.url === link.href)
				|| contentVideoLinks.some(videoLink => videoLink.url === link.href)
			)? null : (
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
