import styles from './Note.module.css';

export function NoteContentImages({
	contentImageLinks,
}: {
	contentImageLinks: string[];
}) {
	return (
		<>
			{contentImageLinks.length > 0 && (
				<div className={styles.contentImages}>
					{contentImageLinks.map((contentImageLink, index) => (
						<img
							key={index}
							className={styles.contentImage}
							src={contentImageLink}
						/>
					))}
				</div>
			)}
		</>
	);
}
