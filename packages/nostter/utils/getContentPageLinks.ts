import { ContentToken } from './getNoteContentTokens';

export type PageLink = {
	url: string;
	type: string;
};

export function getContentPageLinks(contentTokens: ContentToken[]): PageLink[] {
	const firstToken = contentTokens.at(0);
	const lastToken = contentTokens.at(-1);

	return [ firstToken, lastToken ].flatMap(token => {
		if (token?.type !== 'link') {
			return [];
		}

		if (token.mimeType !== 'text/html') {
			return [];
		}

		return [ {
			url: token.link.href,
			type: token.mimeType,
		} ];
	}).slice(0, 1);
}
