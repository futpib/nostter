import { Image } from "./Image";
import { ContentMediaLink } from "./NoteContentMedias";
import styles from './NoteContentMediasDialogContent.module.css';
import { Video } from "./Video";
import { RemoveScroll } from 'react-remove-scroll';

export function NoteContentMediasDialogContent({
	contentMediaLinks,
	onClick,
}: {
	contentMediaLinks: ContentMediaLink[];
	onClick?: () => void;
}) {
	const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
		event.stopPropagation();

		onClick?.();
	};

	return (
		<div
			className={styles.noteContentMediasDialogContent}
			onClick={handleClick}
		>
			<RemoveScroll
				forwardProps
				removeScrollBar
			>
				<div
					className={styles.noteContentMediasDialogContentCarousel}
				>
					{contentMediaLinks.map(({ type, url }) => (
						<div
							className={styles.noteContentMediasDialogContentCarouselItem}
							key={url}
						>
							{type === 'video' ? (
								<Video
									className={styles.noteContentMediasDialogContentCarouselItemVideo}
									src={url}
								/>
							) : (
								<Image
									className={styles.noteContentMediasDialogContentCarouselItemImage}
									src={url}
								/>
							)}
						</div>
					))}
				</div>
			</RemoveScroll>
		</div>
	);
}
