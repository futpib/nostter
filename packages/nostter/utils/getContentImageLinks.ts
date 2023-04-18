import { ContentToken } from "./renderNoteContent";

export type ImageLink = {
	url: string;
	secureUrl?: string;
	type: string;
};

export function getContentImageLinks(contentTokens: ContentToken[]): ImageLink[] {
	const contentImageLinks = contentTokens.flatMap(token => {
		if (token.type !== 'link') {
			return [];
		}

		if (!token.mimeType) {
			return [];
		}

		const [ type ] = token.mimeType.split('/');

		if (type !== 'image') {
			return [];
		}

		return [ {
			url: token.link.href,
			secureUrl: token.link.href.startsWith('https') ? token.link.href : undefined,
			type: token.mimeType,
		} ];
	});

	return contentImageLinks;
}
