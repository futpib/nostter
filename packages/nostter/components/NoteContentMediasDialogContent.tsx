import { Image } from "./Image";
import { ContentMediaLink } from "./NoteContentMedias";
import styles from './NoteContentMediasDialogContent.module.css';
import { Video } from "./Video";
import { RemoveScroll } from 'react-remove-scroll';

export function NoteContentMediasDialogContent({
	contentMediaLinks,
	initialIndex,
	onClick,
}: {
	contentMediaLinks: ContentMediaLink[];
	initialIndex: number;
	onClick?: () => void;
}) {
	const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
		event.stopPropagation();

		onClick?.();
	};

	const handleCarouselRef = (element: HTMLElement | null) => {
		if (!element) {
			return;
		}

		element.scrollLeft = initialIndex * element.clientWidth;
	};

	return (
		<div
			className={styles.noteContentMediasDialogContent}
			onClick={handleClick}
		>
			<RemoveScroll
				forwardProps
				removeScrollBar
				ref={handleCarouselRef}
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
