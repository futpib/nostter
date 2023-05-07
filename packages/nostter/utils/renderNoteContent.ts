import { EventPointer, ProfilePointer } from "nostr-tools/lib/nip19";
import { ReactNode } from "react";
import invariant from "invariant";
import { ContentToken, ContentTokenHashtag, ContentTokenLink, ContentTokenReference, Reference, getNoteContentTokens } from "./getNoteContentTokens";

export type PubkeyMetadata = {
	name?: string;
	about?: string;
	picture?: string;
	banner?: string;
	display_name?: string;
	website?: string;
	lud06?: string;
	lud16?: string;
	nip05?: string;
	nip05valid?: boolean;
};

export function defaultRender<T extends string | ReactNode>({ token }: {
	token: ContentToken;
}): T {
	return token.string as T;
}

export function isRenderedChildEmpty<T extends string | ReactNode>(value: T): boolean {
	if (value == null) {
		return true;
	}

	if (typeof value === 'string') {
		return value.trim().length === 0;
	}

	return false;
}

export function renderNoteContent<T extends string | ReactNode>({
	content,
	references,
}: {
	content: string;
	references: Reference[];
}, {
	renderEventReference = defaultRender,
	renderProfileReference = defaultRender,
	renderLink = defaultRender,
	renderHashtag = defaultRender,
}: {
	renderEventReference?: (props: {
		key: number | string;
		token: ContentTokenReference;
		eventPointer: EventPointer;
	}) => T;

	renderProfileReference?: (props: {
		key: number | string;
		token: ContentTokenReference;
		profilePointer: ProfilePointer;
	}) => T;

	renderLink?: (props: {
		key: number | string;
		token: ContentTokenLink;
	}) => T;

	renderHashtag?: (props: {
		key: number | string;
		token: ContentTokenHashtag;
	}) => T;
} = {}): {
	contentTokens: ContentToken[];
	contentChildren: T[];
} {
	const tokens = getNoteContentTokens(content, references);

	const contentChildren: T[] = [];

	let key = 0;

	for (const token of tokens) {
		if (token.type === 'string') {
			contentChildren.push(token.string as T);
		} else if (token.type === 'link') {
			contentChildren.push(renderLink({
				key: key++,
				token,
			}));
		} else if (token.type === 'hashtag') {
			contentChildren.push(renderHashtag({
				key: key++,
				token,
			}));
		} else if (token.type === 'reference') {
			const { reference } = token;

			if (reference.profile) {
				contentChildren.push(renderProfileReference({
					key: key++,
					token,
					profilePointer: reference.profile,
				}));
			} else if (reference.event) {
				contentChildren.push(renderEventReference({
					key: key++,
					token,
					eventPointer: reference.event,
				}));
			} else {
				contentChildren.push(reference.text as T);
			}
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
		contentChildren: contentChildren.filter(child => Boolean(child)),
	};
}
