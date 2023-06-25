'use client';

import { getProfileContactsActiveTab, ProfileContactsTab, ProfileContactsTabData, profileContactsTabs } from '@/utils/getProfileContactsActiveTab';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { TabData, Tabs } from './Tabs';

export function ProfileContactsTabs() {
	const pathname = usePathname();

	const activeTab = useMemo(() => getProfileContactsActiveTab(pathname ?? undefined), [ pathname ]);

	const pathnameWithoutTab = useMemo(() => {
		for (const { routeSegment } of Object.values(profileContactsTabs).reverse()) {
			if (pathname?.endsWith('/' + routeSegment)) {
				return pathname.replace('/' + routeSegment, '');
			}
		}

		return pathname;
	}, [ pathname ]);

	const tabs = useMemo((): Record<ProfileContactsTab, TabData> => {
		return Object.fromEntries(Object.entries(profileContactsTabs).map(([ key, { label, routeSegment } ]) => {
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
		<Tabs<ProfileContactsTab>
			activeTab={activeTab}
			tabs={tabs}
		/>
	);
}
