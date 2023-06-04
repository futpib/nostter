'use client';

import { FaHashtag } from 'react-icons/fa';
import { HeaderButton } from './HeaderButton';

export function HeaderExploreButton() {
	return (
		<HeaderButton
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
