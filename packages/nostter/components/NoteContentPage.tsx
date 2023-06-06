'use client';

import { tryParseUrl } from '@/utils/tryParseUrl';
import { MouseEvent } from 'react';
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
	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		event.stopPropagation();
		window.open(pageLinkMetadata.url, '_blank');
	};

	const urlParsed = tryParseUrl(pageLinkMetadata.url);

	return (
		<div
			className={styles.noteContentPage}
			onClick={handleClick}
			onAuxClick={handleClick}
		>
			<Image
				className={styles.noteContentPageImage}
				src={pageLinkMetadata.image}
				onClick={handleClick}
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
	);
}
