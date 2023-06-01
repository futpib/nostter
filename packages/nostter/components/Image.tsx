'use client';

import { emptyImage } from "@/constants/emptyImage";
import { CSSProperties, MouseEvent, useCallback, useState } from "react";

export function Image({
	style,
	className,
	src,
	fallbackSrc,
	onClick,
}: {
	style?: CSSProperties;
	className?: string;
	src?: string;
	fallbackSrc?: string;
	onClick?: (event: MouseEvent<HTMLImageElement>) => void;
}) {
	const handleClick = useCallback((event: MouseEvent<HTMLImageElement>) => {
		if (!onClick) {
			return;
		}

		event.stopPropagation();
		onClick(event);
	}, [ onClick ]);

	const [ didError, setDidError ] = useState(false);

	const handleError = useCallback(() => {
		setDidError(true);
	}, []);

	const effectiveSrc = (didError ? fallbackSrc : src) || emptyImage;

	return (
		<img
			style={style}
			className={className}
			src={effectiveSrc}
			onClick={handleClick}
			onError={handleError}
		/>
	);
}
