import { ContentToken } from "./renderNoteContent";

export function getContentImageLinks(contentTokens: ContentToken[]): string[] {
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

		return [ token.link.href ];
	});

	return contentImageLinks;
}
