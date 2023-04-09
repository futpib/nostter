import classNames from 'classnames';
import { ImageLink } from '@/utils/getContentImageLinks';
import styles from './NoteContentImages.module.css';
import { NoteContentVideo } from './NoteContentVideo';
import { Image } from './Image';
import { CSSProperties, useMemo } from 'react';

type ContentMediaSize = 'full' | 'half' | 'quarter';
type ContentMediaLink = {
	type: 'image' | 'video';
	url: string;
	size: ContentMediaSize;
	style: CSSProperties;
};

export function NoteContentImages({
	embedded,
	contentImageLinks,
	contentVideoLinks,
}: {
	embedded?: boolean;
	contentImageLinks: ImageLink[];
	contentVideoLinks: ImageLink[];
}) {
	const contentMediaLinks = useMemo(() => {
		const uniqueByUrl = new Map<string, ContentMediaLink>();

		for (const contentVideoLink of contentVideoLinks) {
			uniqueByUrl.set(contentVideoLink.url, {
				type: 'video',
				url: contentVideoLink.url,
				size: 'full',
				style: {},
			});
		}

		for (const contentImageLink of contentImageLinks) {
			uniqueByUrl.set(contentImageLink.url, {
				type: 'image',
				url: contentImageLink.url,
				size: 'full',
				style: {},
			});
		}

		const contentMediaLinks = [...uniqueByUrl.values()];

		const contentMediaLinksLength = contentMediaLinks.length;

		if (contentMediaLinksLength === 1) {
			const contentMediaLink = contentMediaLinks[0];
			contentMediaLink.size = 'full';
			contentMediaLink.style.gridColumnStart = 1;
			contentMediaLink.style.gridColumnEnd = 3;
			contentMediaLink.style.gridRowStart = 1;
			contentMediaLink.style.gridRowEnd = 3;
		} else if (contentMediaLinksLength === 2) {
			for (let index = 0; index < contentMediaLinksLength; index++) {
				const contentMediaLink = contentMediaLinks[index];
				contentMediaLink.size = 'half';
				contentMediaLink.style.gridColumnStart = index + 1;
				contentMediaLink.style.gridColumnEnd = index + 2;
				contentMediaLink.style.gridRowStart = 1;
				contentMediaLink.style.gridRowEnd = 3;
			}
		} else if (contentMediaLinksLength >= 3) {
			for (let index = 0; index < contentMediaLinksLength; index++) {
				const contentMediaLink = contentMediaLinks[index];

				if ((contentMediaLinksLength % 2) === 0) {
					contentMediaLink.size = 'quarter';
					contentMediaLink.style.gridColumnStart = (index % 2) + 1;
					contentMediaLink.style.gridRowStart = Math.floor(index / 2) + 1;
				} else {
					if (index === 0) {
						contentMediaLink.size = 'half';
						contentMediaLink.style.gridColumnStart = 1;
						contentMediaLink.style.gridColumnEnd = 2;
						contentMediaLink.style.gridRowStart = 1;
						contentMediaLink.style.gridRowEnd = 3;
					} else if (index <= 2) {
						contentMediaLink.size = 'quarter';
						contentMediaLink.style.gridColumnStart = 2;
						contentMediaLink.style.gridRowStart = index;
					} else {
						contentMediaLink.size = 'quarter';
						contentMediaLink.style.gridColumnStart = ((index - 1) % 2) + 1;
						contentMediaLink.style.gridRowStart = Math.ceil(index / 2) + 1;
					}
				}

				contentMediaLink.style.gridColumnEnd = (
					contentMediaLink.style.gridColumnEnd
					?? contentMediaLink.style.gridColumnStart + 1
				);
				contentMediaLink.style.gridRowEnd = (
					contentMediaLink.style.gridRowEnd
					?? contentMediaLink.style.gridRowStart + 1
				);
			}
		}

		return contentMediaLinks;
	}, [contentImageLinks, contentVideoLinks]);

	return (
		<>
			{contentMediaLinks.length > 0 && (
				<div className={classNames(styles.contentImages, embedded && styles.contentImagesEmbedded)}>
					{contentMediaLinks.map(({ type, url, style }) => {
						return (
							type === 'video' ? (
								<NoteContentVideo
									style={style}
									key={url}
									src={url}
								/>
							) : (
								<Image
									style={style}
									className={styles.contentImage}
									key={url}
									src={url}
								/>
							)
						);
					})}
				</div>
			)}
		</>
	);
}
