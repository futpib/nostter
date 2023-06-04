
import classNames from 'classnames';
import invariant from 'invariant';
import Link from 'next/link';
import { ReactNode } from 'react';
import styles from './HeaderButton.module.css';

const components = {
	Link,
	button: 'button',
} as const;

export function HeaderButton({
	className,
	componentKey,
	href,
	iconChildren,
	children,
}: {
	className?: string;
	componentKey: keyof typeof components;
	href?: string;
	iconChildren: ReactNode;
	children: ReactNode;
}) {
	const Component = components[componentKey];

	if (componentKey === 'Link') {
		invariant(href, 'href is required for Link');
	}

	return (
		<Component
			className={classNames(styles.headerButton, className)}
			href={href as string}
		>
			{iconChildren}
			<span
				className={styles.headerButtonText}
			>
				{children}
			</span>
		</Component>
	);
}
