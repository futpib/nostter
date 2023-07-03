'use client';

import { useAccounts } from '@/hooks/useAccounts';
import classNames from 'classnames';
import { nip19 } from 'nostr-tools';
import { FaUser } from 'react-icons/fa';
import { HeaderButton } from './HeaderButton';
import styles from './HeaderProfileButton.module.css';

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
			href={`/${nip19.npubEncode(primaryAccount?.pubkey)}`}
			iconChildren={(
				<FaUser />
			)}
		>
			Profile
		</HeaderButton>
	) : null;
}
