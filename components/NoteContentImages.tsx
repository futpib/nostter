import { ImageLink } from '@/utils/getContentImageLinks';
import styles from './NoteContentImages.module.css';

export function NoteContentImages({
	contentImageLinks,
}: {
	contentImageLinks: ImageLink[];
}) {
	return (
		<>
			{contentImageLinks.length > 0 && (
				<div className={styles.contentImages}>
					{contentImageLinks.map((contentImageLink, index) => (
						<img
							key={index}
							className={styles.contentImage}
							src={contentImageLink.url}
						/>
					))}
				</div>
			)}
		</>
	);
}
