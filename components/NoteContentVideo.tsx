"use client";

import { MouseEvent, useCallback } from 'react';
import styles from './NoteContentVideo.module.css';

export function NoteContentVideo({
	src,
}: {
	src: string;
}) {
	const handleClick = useCallback((event: MouseEvent<HTMLVideoElement>) => {
		event.stopPropagation();
	}, []);

	return (
		<video
			controls
			className={styles.contentVideo}
			src={src}
			onClick={handleClick}
		/>
	);
}
