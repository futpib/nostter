import { findLinks } from "./findLinks";

export function parseSearch(query: string) {
	const links = findLinks(query);

	const hashtags = links.filter(link => link.type === 'hashtag');

	if (hashtags.length === 0) {
		return {};
	}

	const referencedHashtags = hashtags.map(hashtag => hashtag.value.replace('#', '')).sort();

	return {
		referencedHashtags,
	};
}
