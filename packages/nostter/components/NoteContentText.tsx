import { ReactNode, useMemo } from 'react';
import { PubkeyMetadata, renderNoteContent } from '@/utils/renderNoteContent';
import styles from './NoteContentText.module.css';
import { ImageLink } from '@/utils/getContentImageLinks';
import { ProfileMentionNameTextLink } from './ProfileMentionNameTextLink';
import { Reference } from '@/utils/getNoteContentTokens';
import { PageLink } from '@/utils/getContentPageLinks';
import { PageLinkMetadata } from './NoteContentPage';
import { ExternalLink } from './ExternalLink';
import { HashtagLink } from './HashtagLink';

function isAllNewlines(contentChild: ReactNode) {
	return (
		typeof contentChild === 'string'
		&& contentChild.split('\n').every(line => line.trim() === '')
	);
}

export function NoteContentText({
	content,
	references,
	pubkeyMetadatas,
	contentImageLinks,
	contentVideoLinks,
	contentPageLinks,
	pageLinkMetadatas,
}: {
	content: string;
	references: Reference[];
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
	contentImageLinks: ImageLink[];
	contentVideoLinks: ImageLink[];
	contentPageLinks: PageLink[];
	pageLinkMetadatas: Map<string, PageLinkMetadata>;
}) {
	const contentChildren = useMemo(() => {
		const { contentChildren } = renderNoteContent<ReactNode>({
			content,
			references,
		}, {
			renderEventReference: () => null,

			renderProfileReference: ({ key, profilePointer }) => (
				<ProfileMentionNameTextLink
					key={key}
					pubkey={profilePointer.pubkey}
					pubkeyMetadatas={pubkeyMetadatas}
				/>
			),

			renderLink: ({ key, token: { link } }) => (
				contentImageLinks.some(imageLink => imageLink.url === link.href)
				|| contentVideoLinks.some(videoLink => videoLink.url === link.href)
				|| contentPageLinks.some(pageLink => pageLink.url === link.href && pageLinkMetadatas.has(pageLink.url))
			) ? null : (
				<ExternalLink
					key={key}
					href={link.href}
				>
					{link.value}
				</ExternalLink>
			),

			renderHashtag: ({ key, token: { link } }) => (
				<HashtagLink
					key={key}
					href={link.href}
				>
					{link.value}
				</HashtagLink>
			),
		});

		return contentChildren.flatMap((contentChild, index) => {
			const previousContentChild = contentChildren[index - 1];

			if (isAllNewlines(previousContentChild) && isAllNewlines(contentChild)) {
				return [];
			}

			return [contentChild];
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
