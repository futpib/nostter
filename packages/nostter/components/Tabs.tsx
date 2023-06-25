'use client';

import classNames from 'classnames';
import Link from 'next/link';
import { ReactNode } from 'react';
import styles from './Tabs.module.css';

export type TabData = {
	label: ReactNode;
	href: string;
};

export function Tabs<T extends string = string>({
	activeTab,
	tabs,
}: {
	activeTab: T;
	tabs: Record<T, TabData>;
}) {
	return (
		<div
			className={styles.tabs}
		>
			{Object.entries<TabData>(tabs).map(([ key, { label, href } ]) => (
				<Link
					className={classNames(
						styles.tab,
						key === activeTab && styles.tabActive,
					)}
					key={key}
					href={href}
				>
					<div className={styles.tabLabel}>
						{label}
					</div>
				</Link>
			))}
		</div>
	);
}
