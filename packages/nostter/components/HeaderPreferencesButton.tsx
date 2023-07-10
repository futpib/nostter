'use client';

import classNames from 'classnames';
import { FaCog } from 'react-icons/fa';
import { HeaderButton } from './HeaderButton';
import styles from './HeaderPreferencesButton.module.css';

export function HeaderPreferencesButton({
	className,
}: {
	className?: string;
}) {
	return (
		<HeaderButton
			componentKey="Link"
			className={classNames(styles.headerPreferencesButton, className)}
			iconChildren={(
				<FaCog />
			)}
			href="/settings"
		>
			Settings
		</HeaderButton>
	);
}
