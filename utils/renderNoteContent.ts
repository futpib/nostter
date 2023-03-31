import { AddressPointer, EventPointer, ProfilePointer } from "nostr-tools/lib/nip19";
import { ReactNode } from "react";
import * as linkify from 'linkifyjs';
import * as mimeTypes from 'mime-types';
import invariant from "invariant";

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

export type Reference = {
	text: string;
	profile?: ProfilePointer;
	event?: EventPointer;
	address?: AddressPointer;
};

type Link = {
	type: string;
	value: string;
	isLink: boolean;
	href: string;
	start: number;
	end: number;
};

type Token = {
	type: 'string';
	string: string;
} | {
	type: 'reference';
	string: string;
	reference: Reference;
} | {
	type: 'link';
	string: string;
	link: Link;
	mimeType?: | string;
};

function defaultRender<T extends string | ReactNode>({ token }: {
	token: Token;
}): T {
	return token.string as T;
}

export function renderNoteContent<T extends string | ReactNode>({
	content,
	references,
	pubkeyMetadatas,
}: {
	content: string;
	references: Reference[];
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
}, {
	renderEventReference = defaultRender,
	renderProfileReference = defaultRender,
	renderLink = defaultRender,
}: {
	renderEventReference?: (props: {
		key: number | string;
		token: Token;
		eventPointer: EventPointer;
	}) => T;

	renderProfileReference?: (props: {
		key: number | string;
		token: Token;
		profilePointer: ProfilePointer;
		metadata: PubkeyMetadata;
	}) => T;

	renderLink?: (props: {
		key: number | string;
		token: Token;
		link: Link;
	}) => T;
}): {
	contentTokens: Token[];
	contentChildren: T[];
} {
	const tokens: Token[] = [];

	const fakeFinalReference = {
		text: Math.random().toString(),
	};

	const unparsedReferences = references.concat([ fakeFinalReference ]);
	let unparsedContent = content;
	let reference = unparsedReferences.shift();

	while (reference) {
		const [ beforeReference, ...afterReference ] = unparsedContent.split(reference.text);

		const linksBeforeReference = linkify.find(beforeReference);

		const unparsedLinks = linksBeforeReference.slice();
		let unparsedBeforeReference = beforeReference;
		let link = unparsedLinks.shift();

		while (link) {
			const [ beforeLink, ...afterLink ] = unparsedBeforeReference.split(link.value);

			tokens.push({
				type: 'string',
				string: beforeLink,
			});

			const mimeType = mimeTypes.lookup(link.href);

			tokens.push({
				type: 'link',
				string: link.value,
				link,
				mimeType: mimeType || undefined,
			});

			unparsedBeforeReference = afterLink.join(link.value);
			link = unparsedLinks.shift();
		}

		tokens.push({
			type: 'string',
			string: unparsedBeforeReference,
		});

		tokens.push({
			type: 'reference',
			string: reference.text,
			reference,
		});

		unparsedContent = afterReference.join(reference.text);

		reference = unparsedReferences.shift();
	}

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

			if (reference === fakeFinalReference) {
				continue;
			}

			if (reference.profile) {
				const metadata = pubkeyMetadatas.get(reference.profile.pubkey);

				if (metadata?.name || metadata?.display_name) {
					contentChildren.push(renderProfileReference({
						key: reference.text,
						token,
						profilePointer: reference.profile,
						metadata,
					}));
				} else {
					contentChildren.push(reference.text as T);
				}
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

	contentChildren.push(unparsedContent as T);

	return {
		contentTokens: tokens,
		contentChildren,
	};
}
