'use client';

import { tryParseUrl } from '@/utils/tryParseUrl';
import { ExternalLink } from './ExternalLink';
import { Image } from './Image';
import styles from './NoteContentPage.module.css';

export type PageLinkMetadata = {
	url: string;
	title: string;
	description: string;
	siteName?: string;
	image: string;
};

export function NoteContentPage({
	pageLinkMetadata,
}: {
	pageLinkMetadata: PageLinkMetadata;
}) {
	const urlParsed = tryParseUrl(pageLinkMetadata.url);

	return (
		<ExternalLink
			unstyled
			href={pageLinkMetadata.url}
		>
			<div
				className={styles.noteContentPage}
			>
				<Image
					className={styles.noteContentPageImage}
					src={pageLinkMetadata.image}
				/>

				<div
					className={styles.noteContentPageText}
				>
					<div
						className={styles.noteContentPageSiteName}
					>
						{pageLinkMetadata.siteName ?? urlParsed?.hostname ?? pageLinkMetadata.url}
					</div>

					<div
						className={styles.noteContentPageTitle}
					>
						{pageLinkMetadata.title}
					</div>

					<div
						className={styles.noteContentPageDescription}
					>
						{pageLinkMetadata.description}
					</div>
				</div>
			</div>
		</ExternalLink>
	);
}
