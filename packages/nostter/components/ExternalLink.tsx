'use client';

import classNames from 'classnames';
import Link from 'next/link';
import { MouseEvent, ReactNode, useCallback } from 'react';
import styles from './ExternalLink.module.css';

export function ExternalLink({
	unstyled,
	href,
	children,
}: {
	unstyled?: boolean;
	href: string;
	children: ReactNode;
}) {
	const handleClick = useCallback((event: MouseEvent) => {
		event.stopPropagation();
	}, []);

	return (
		<Link
			className={classNames(!unstyled && styles.externalLink)}
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			onClick={handleClick}
			onAuxClick={handleClick}
		>
			{children}
		</Link>
	);
}
