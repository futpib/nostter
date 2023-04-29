'use client';

import classNames from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import styles from './ProfileTabs.module.css';

const profileTabs = {
	notes: {
		label: 'Notes',
		routeSegment: '',
	},
	replies: {
		label: 'Replies',
		routeSegment: 'replies',
	},
	likes: {
		label: 'Likes',
		routeSegment: 'likes',
	},
} as const;

type ProfileTab = keyof typeof profileTabs;

export function ProfileTabs() {
	const pathname = usePathname();

	const activeTab = useMemo((): ProfileTab => {
		for (const [ key, { routeSegment } ] of Object.entries(profileTabs).reverse()) {
			if (pathname?.endsWith(routeSegment)) {
				return key as ProfileTab;
			}
		}

		return 'notes';
	}, [ pathname ]);

	const pathnameWithoutTab = useMemo(() => {
		for (const { routeSegment } of Object.values(profileTabs).reverse()) {
			if (pathname?.endsWith('/' + routeSegment)) {
				return pathname.replace('/' + routeSegment, '');
			}
		}

		return pathname;
	}, [ pathname ]);

	return (
		<div
			className={styles.profileTabs}
		>
			{Object.entries(profileTabs).map(([ key, { label, routeSegment } ]) => (
				<Link
					className={classNames(
						styles.profileTab,
						key === activeTab && styles.profileTabActive,
					)}
					key={key}
					href={`${pathnameWithoutTab}/${routeSegment}`.replaceAll('//', '/')}
				>
					<div className={styles.profileTabLabel}>
						{label}
					</div>
				</Link>
			))}
		</div>
	);
}
