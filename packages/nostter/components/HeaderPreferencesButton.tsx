'use client';

import { FaEllipsisH } from 'react-icons/fa';
import { HeaderButton } from './HeaderButton';

export function HeaderPreferencesButton({
	className,
}: {
	className?: string;
}) {
	return (
		<HeaderButton
			componentKey="Link"
			iconChildren={(
				<FaEllipsisH />
			)}
			href="/settings"
		>
			Settings
		</HeaderButton>
	);
}
