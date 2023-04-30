
export const profileTabs = {
	notes: {
		label: 'Notes',
		routeSegment: '',
	},
	replies: {
		label: 'Replies',
		routeSegment: 'replies',
	},
	// likes: {
	// 	label: 'Likes',
	// 	routeSegment: 'likes',
	// },
} as const;

export type ProfileTab = keyof typeof profileTabs;

export function isProfileTab(tab: unknown): tab is ProfileTab {
	return typeof tab === 'string' && profileTabs.hasOwnProperty(tab);
}

export function getProfileActiveTab(pathname: undefined | string): ProfileTab {
	for (const [ key, { routeSegment } ] of Object.entries(profileTabs).reverse()) {
		if (pathname?.endsWith(routeSegment)) {
			return key as ProfileTab;
		}
	}

	return 'notes';
}
