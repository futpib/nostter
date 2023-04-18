import { ReactNode } from "react";
import invariant from "invariant";
import { ContentToken, ContentTokenHashtag, ContentTokenLink, getNoteContentTokens } from "./getNoteContentTokens";
import { Link } from "./findLinks";
import { defaultRender, isRenderedChildEmpty } from "./renderNoteContent";

export function renderAboutContent<T extends string | ReactNode>({
	content,
}: {
	content: string;
}, {
	renderLink = defaultRender,
	renderHashtag = defaultRender,
}: {
	renderLink?: (props: {
		key: number | string;
		token: ContentTokenLink;
		link: Link;
	}) => T;

	renderHashtag?: (props: {
		key: number | string;
		token: ContentTokenHashtag;
		link: Link;
	}) => T;
} = {}): {
	contentTokens: ContentToken[];
	contentChildren: T[];
} {
	const tokens = getNoteContentTokens(content, []);

	const contentChildren: T[] = [];

	for (const token of tokens) {
		if (token.type === 'string') {
			contentChildren.push(token.string as T);
		} else if (token.type === 'link') {
			const { link } = token;

			contentChildren.push(renderLink({
				key: link.start,
				token,
				link,
			}));
		} else if (token.type === 'hashtag') {
			const { link } = token;

			contentChildren.push(renderHashtag({
				key: link.start,
				token,
				link,
			}));
		} else if (token.type === 'reference') {
			contentChildren.push(defaultRender({
				token,
			}));
		} else {
			invariant(false, 'Unknown token type');
		}
	}

	while (contentChildren.length > 0 && isRenderedChildEmpty(contentChildren[0])) {
		contentChildren.shift();
	}

	while (contentChildren.length > 0 && isRenderedChildEmpty(contentChildren[contentChildren.length - 1])) {
		contentChildren.pop();
	}

	return {
		contentTokens: tokens,
		contentChildren,
	};
}
