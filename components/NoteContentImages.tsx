import classNames from 'classnames';
import { ImageLink } from '@/utils/getContentImageLinks';
import styles from './NoteContentImages.module.css';
import { NoteContentVideo } from './NoteContentVideo';

export function NoteContentImages({
	embedded,
	contentImageLinks,
	contentVideoLinks,
}: {
	embedded?: boolean;
	contentImageLinks: ImageLink[];
	contentVideoLinks: ImageLink[];
}) {
	return (
		<>
			{(contentImageLinks.length > 0 || contentVideoLinks.length > 0) && (
				<div className={classNames(styles.contentImages, embedded && styles.contentImagesEmbedded)}>
					{contentVideoLinks.map(contentVideoLink => (
						<NoteContentVideo
							key={contentVideoLink.url}
							src={contentVideoLink.url}
						/>
					))}
					{contentImageLinks.map(contentImageLink => (
						<img
							key={contentImageLink.url}
							className={styles.contentImage}
							src={contentImageLink.url}
						/>
					))}
				</div>
			)}
		</>
	);
}
