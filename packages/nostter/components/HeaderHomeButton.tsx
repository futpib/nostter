'use client';

import { useAccounts } from '@/hooks/useAccounts';
import { FaHome } from 'react-icons/fa';
import { HeaderButton } from './HeaderButton';

export function HeaderHomeButton() {
	const { primaryAccount } = useAccounts();

	return primaryAccount ? (
		<HeaderButton
			componentKey="Link"
			href="/home"
			iconChildren={(
				<FaHome />
			)}
		>
			Home
		</HeaderButton>
	) : null;
}
