import { emptyImage } from "@/constants/emptyImage";
import { CSSProperties } from "react";

export function Image({
	style,
	className,
	src,
}: {
	style?: CSSProperties;
	className?: string;
	src?: string;
}) {
	return (
		<img
			style={style}
			className={className}
			src={src || emptyImage}
		/>
	);
}
