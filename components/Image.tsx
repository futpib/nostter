'use client';

import { emptyImage } from "@/constants/emptyImage";
import { CSSProperties, MouseEvent, useCallback } from "react";

export function Image({
	style,
	className,
	src,
	onClick,
}: {
	style?: CSSProperties;
	className?: string;
	src?: string;
	onClick?: () => void;
}) {
	const handleClick = useCallback((event: MouseEvent<HTMLImageElement>) => {
		event.stopPropagation();

		onClick?.();
	}, [ onClick ]);

	return (
		<img
			style={style}
			className={className}
			src={src || emptyImage}
			onClick={handleClick}
		/>
	);
}
