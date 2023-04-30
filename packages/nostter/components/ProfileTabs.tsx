'use client';

import { useFirstRestParam } from '@/hooks/useFirstRestParam';
import { getProfileActiveTab, profileTabs } from '@/utils/getProfileActiveTab';
import classNames from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import styles from './ProfileTabs.module.css';

export function ProfileTabs() {
	const pathname = usePathname();
	const firstRestParam = useFirstRestParam();

	const activeTab = useMemo(() => getProfileActiveTab(firstRestParam), [ firstRestParam ]);

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
