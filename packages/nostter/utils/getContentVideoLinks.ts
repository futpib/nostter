import { ImageLink } from "./getContentImageLinks";
import { ContentToken } from "./getNoteContentTokens";

export type VideoLink = ImageLink;

export function getContentVideoLinks(contentTokens: ContentToken[]): VideoLink[] {
	const contentVideoLinks = contentTokens.flatMap(token => {
		if (token.type !== 'link') {
			return [];
		}

		if (!token.mimeType) {
			return [];
		}

		const [ type ] = token.mimeType.split('/');

		if (type !== 'video') {
			return [];
		}

		return [ {
			url: token.link.href,
			secureUrl: token.link.href.startsWith('https') ? token.link.href : undefined,
			type: token.mimeType,
		} ];
	});

	return contentVideoLinks;
}
