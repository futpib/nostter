import { ImageLink } from '@/utils/getContentImageLinks';
import styles from './NoteContentImages.module.css';
import { NoteContentVideo } from './NoteContentVideo';

export function NoteContentImages({
	contentImageLinks,
	contentVideoLinks,
}: {
	contentImageLinks: ImageLink[];
	contentVideoLinks: ImageLink[];
}) {
	console.log({
		contentImageLinks,
		contentVideoLinks,
	});

	return (
		<>
			{(contentImageLinks.length > 0 || contentVideoLinks.length > 0) && (
				<div className={styles.contentImages}>
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
