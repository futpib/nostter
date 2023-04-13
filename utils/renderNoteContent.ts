import { EventPointer, ProfilePointer } from "nostr-tools/lib/nip19";
import { ReactNode } from "react";
import invariant from "invariant";
import { ContentToken, Reference, getNoteContentTokens } from "./getNoteContentTokens";
import { Link } from "./findLinks";

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
}: {
	renderEventReference?: (props: {
		key: number | string;
		token: ContentToken;
		eventPointer: EventPointer;
	}) => T;

	renderProfileReference?: (props: {
		key: number | string;
		token: ContentToken;
		profilePointer: ProfilePointer;
	}) => T;

	renderLink?: (props: {
		key: number | string;
		token: ContentToken;
		link: Link;
	}) => T;
} = {}): {
	contentTokens: ContentToken[];
	contentChildren: T[];
} {
	const tokens = getNoteContentTokens(content, references);

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
		} else if (token.type === 'reference') {
			const { reference } = token;

			if (reference.profile) {
				contentChildren.push(renderProfileReference({
					key: reference.text,
					token,
					profilePointer: reference.profile,
				}));
			} else if (reference.event) {
				contentChildren.push(renderEventReference({
					key: reference.text,
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
		contentChildren,
	};
}

/**
 * @deprecated Use `Reference` instead
 */
type DeprecatedExportReference = Reference;

/**
 * @deprecated Use `ContentToken` instead
 */
type DeprecatedExportContentToken = ContentToken;

export type {
	DeprecatedExportReference as Reference,
	DeprecatedExportContentToken as ContentToken,
};
