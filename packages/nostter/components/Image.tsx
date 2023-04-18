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
	onClick?: () => void;
}) {
	const handleClick = useCallback((event: MouseEvent<HTMLImageElement>) => {
		event.stopPropagation();

		onClick?.();
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
