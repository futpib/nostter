'use client';

import Link from 'next/link';
import { MouseEvent, ReactNode, useCallback } from 'react';
import styles from './HashtagLink.module.css';

export function HashtagLink({
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
			className={styles.hashtagLink}
			href={`/search?q=${encodeURIComponent(href)}`}
			onClick={handleClick}
			onAuxClick={handleClick}
		>
			{children}
		</Link>
	);
}
