import { AddressPointer, EventPointer, ProfilePointer } from "nostr-tools/lib/nip19";
import { guessMimeType } from "./guessMimeType";
import { findLinks, Link } from "./findLinks";

export type Reference = {
	text: string;
	profile?: ProfilePointer;
	event?: EventPointer;
	address?: AddressPointer;
};

export type ContentTokenString = {
	type: 'string';
	string: string;
};

export type ContentTokenReference = {
	type: 'reference';
	string: string;
	reference: Reference;
};

export type ContentTokenLink = {
	type: 'link';
	string: string;
	link: Link;
	mimeType?: | string;
};

export type ContentTokenHashtag = {
	type: 'hashtag';
	string: string;
	link: Link;
};

export type ContentToken =
	| ContentTokenString
	| ContentTokenReference
	| ContentTokenLink
	| ContentTokenHashtag
;

function isContentTokenEmpty(contentToken: ContentToken) {
	return contentToken.type === 'string' && contentToken.string.trim() === '';
}

export function getNoteContentTokens(content: string, references: Reference[]): ContentToken[] {
	let tokens: ContentToken[] = [];

	const fakeFinalReference = {
		text: Math.random().toString(),
	};

	const unparsedReferences = references.concat([ fakeFinalReference ]);
	let unparsedContent = content;
	let reference = unparsedReferences.shift();

	while (reference) {
		const [ beforeReference, ...afterReference ] = unparsedContent.split(reference.text);

		const linksBeforeReference = findLinks(beforeReference);

		const unparsedLinks = linksBeforeReference.slice();
		let unparsedBeforeReference = beforeReference;
		let link = unparsedLinks.shift();

		while (link) {
			const [ beforeLink, ...afterLink ] = unparsedBeforeReference.split(link.value);

			tokens.push({
				type: 'string',
				string: beforeLink,
			});

			if (link.type === 'hashtag') {
				tokens.push({
					type: 'hashtag',
					string: link.value,
					link,
				});
			} else {
				const mimeType = guessMimeType(link.href);

				tokens.push({
					type: 'link',
					string: link.value,
					link,
					mimeType: mimeType || undefined,
				});
			}

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

	tokens.push({
		type: 'string',
		string: unparsedContent,
	});

	tokens = tokens.flatMap(token => {
		if (token.type === 'reference' && token.reference === fakeFinalReference) {
			return [];
		}

		if (token.type === 'string') {
			const stringTrimmed = token.string.trimEnd();

			if (stringTrimmed !== token.string) {
				return [
					{
						type: 'string',
						string: stringTrimmed,
					},
					{
						type: 'string',
						string: token.string.slice(stringTrimmed.length),
					},
				];
			}
		}

		return [ token ];
	});

	while (tokens.length > 0 && isContentTokenEmpty(tokens[0])) {
		tokens.shift();
	}

	while (tokens.length > 0 && isContentTokenEmpty(tokens[tokens.length - 1])) {
		tokens.pop();
	}

	return tokens;
}
