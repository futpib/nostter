'use client';

import { useAccounts } from '@/hooks/useAccounts';
import classNames from 'classnames';
import { FaUser } from 'react-icons/fa';
import { HeaderButton } from './HeaderButton';
import styles from './HeaderProfileButton.module.css';
import { npubEncode } from '../utils/npubEncode';

export function HeaderProfileButton({
	className,
}: {
	className?: string;
}) {
	const { primaryAccount } = useAccounts();

	return primaryAccount ? (
		<HeaderButton
			componentKey="Link"
			className={classNames(styles.headerProfileButton, className)}
			href={`/${npubEncode(primaryAccount.pubkey)}`}
			iconChildren={(
				<FaUser />
			)}
		>
			Profile
		</HeaderButton>
	) : null;
}
