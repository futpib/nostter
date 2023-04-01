"use client";

import classNames from 'classnames';
import { CSSProperties, MouseEvent, useCallback } from 'react';
import styles from './NoteContentVideo.module.css';

export function NoteContentVideo({
	style,
	className,
	src,
}: {
	style?: CSSProperties;
	className?: string;
	src: string;
}) {
	const handleClick = useCallback((event: MouseEvent<HTMLVideoElement>) => {
		event.stopPropagation();
	}, []);

	return (
		<video
			controls
			style={style}
			className={classNames(styles.contentVideo, className)}
			src={src}
			onClick={handleClick}
		/>
	);
}
