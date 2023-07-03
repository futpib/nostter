'use client';

import { useAccounts } from '@/hooks/useAccounts';
import { FaHome } from 'react-icons/fa';
import { HeaderButton } from './HeaderButton';

export function HeaderHomeButton({
	className,
}: {
	className?: string;
}) {
	const { primaryAccount } = useAccounts();

	return primaryAccount ? (
		<HeaderButton
			className={className}
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
