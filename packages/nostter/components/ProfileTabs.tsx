'use client';

import { useFirstRestParam } from '@/hooks/useFirstRestParam';
import { getProfileActiveTab, ProfileTab, profileTabs } from '@/utils/getProfileActiveTab';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { TabData, Tabs } from './Tabs';

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

	const tabs = useMemo((): Record<ProfileTab, TabData> => {
		return Object.fromEntries(Object.entries(profileTabs).map(([ key, { label, routeSegment } ]) => {
			return [
				key,
				{
					label,
					href: `${pathnameWithoutTab}/${routeSegment}`.replaceAll('//', '/'),
				},
			];
		})) as any;
	}, [ pathnameWithoutTab ]);

	return (
		<Tabs<ProfileTab>
			activeTab={activeTab}
			tabs={tabs}
		/>
	);
}
