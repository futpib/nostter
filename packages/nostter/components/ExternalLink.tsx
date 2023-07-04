'use client';

import Link from 'next/link';
import { MouseEvent, ReactNode, useCallback } from 'react';
import styles from './ExternalLink.module.css';

export function ExternalLink({
	href,
	children,
}: {
	href: string;
	children: ReactNode;
}) {
	const handleClick = useCallback((event: MouseEvent) => {
		event.stopPropagation();
	}, []);

	return (
		<Link
			className={styles.externalLink}
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
