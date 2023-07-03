'use client';

import { FaHashtag } from 'react-icons/fa';
import { HeaderButton } from './HeaderButton';

export function HeaderExploreButton({
	className,
}: {
	className?: string;
}) {
	return (
		<HeaderButton
			className={className}
			componentKey="Link"
			href="/explore"
			iconChildren={(
				<FaHashtag />
			)}
		>
			Explore
		</HeaderButton>
	);
}
