import { useMemo } from "react";
import { Image } from "./Image";

export function SmallAvatarImage({
	className,
	src,
}: {
	className?: string;
	src: undefined | string;
}) {
	const smallSrc = useMemo(() => {
		if (!src) {
			return undefined;
		}

		const encodedSrc = encodeURIComponent(src);

		return `/api/image/${encodedSrc}/small`;
	}, [src]);

	return (
		<Image
			key={src}
			className={className}
			src={smallSrc}
			fallbackSrc={src}
		/>
	);
}
