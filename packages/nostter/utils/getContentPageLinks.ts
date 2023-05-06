import { ContentToken } from './getNoteContentTokens';

export type PageLink = {
	url: string;
	type: string;
};

function keepHtmlLinks(token: ContentToken | undefined) {
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
}

export function getContentPageLinks(contentTokens: ContentToken[]): PageLink[] {
	const allLinks = contentTokens.flatMap(keepHtmlLinks);

	if (allLinks.length === 1) {
		return allLinks;
	}

	const firstToken = contentTokens.at(0);
	const lastToken = contentTokens.at(-1);

	return [ firstToken, lastToken ].flatMap(keepHtmlLinks).slice(0, 1);
}
