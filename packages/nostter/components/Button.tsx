
import { ReactNode } from 'react';
import styles from './Button.module.css';

export function Button({
	disabled = false,
	type = 'button',
	onClick,
	children,
}: {
	disabled?: boolean;
	type?: 'button' | 'submit';
	onClick?: () => void;
	children: ReactNode;
}) {
	return (
		<button
			className={styles.button}
			type={type}
			disabled={disabled}
			onClick={onClick}
		>
			{children}
		</button>
	);
}
