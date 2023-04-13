"use client";

import { CSSProperties, MouseEvent, useCallback } from 'react';

export function Video({
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
	const handleClick = useCallback((event: MouseEvent<HTMLVideoElement>) => {
		event.stopPropagation();

		onClick?.();
	}, [ onClick ]);

	return (
		<video
			controls
			style={style}
			className={className}
			src={src}
			onClick={handleClick}
		/>
	);
}
