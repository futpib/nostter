
import Link from 'next/link';
import { ReactNode } from 'react';
import styles from './Button.module.css';

export function Button({
	disabled = false,
	type = 'button',
	href,
	onClick,
	children,
}: {
	disabled?: boolean;
	type?: 'button' | 'submit';
	href?: string;
	onClick?: () => void;
	children: ReactNode;
}) {
	const Component = href ? Link : 'button';

	return (
		<Component
			className={styles.button}
			type={type}
			href={href ?? ''}
			disabled={disabled}
			onClick={onClick}
		>
			{children}
		</Component>
	);
}
