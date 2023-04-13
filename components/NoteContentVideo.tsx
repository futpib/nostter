"use client";

import classNames from 'classnames';
import { CSSProperties } from 'react';
import styles from './NoteContentVideo.module.css';
import { Video } from './Video';

export function NoteContentVideo({
	style,
	className,
	src,
	onClick,
}: {
	style?: CSSProperties;
	className?: string;
	src: string;
	onClick?: () => void;
}) {
	return (
		<Video
			style={style}
			className={classNames(styles.contentVideo, className)}
			src={src}
			onClick={onClick}
		/>
	);
}
