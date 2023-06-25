
export const profileContactsTabs = {
	following: {
		label: 'Following',
		routeSegment: 'following',
	},
} as const;

export type ProfileContactsTab = keyof typeof profileContactsTabs;

export type ProfileContactsTabData = (typeof profileContactsTabs)[ProfileContactsTab];

export function isProfileContactsTab(tab: unknown): tab is ProfileContactsTab {
	return typeof tab === 'string' && profileContactsTabs.hasOwnProperty(tab);
}

export function getProfileContactsActiveTab(pathname: undefined | string): ProfileContactsTab {
	for (const [ key, { routeSegment } ] of Object.entries(profileContactsTabs).reverse()) {
		if (pathname?.endsWith(routeSegment)) {
			return key as ProfileContactsTab;
		}
	}

	return 'following';
}
