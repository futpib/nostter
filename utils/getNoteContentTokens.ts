import { AddressPointer, EventPointer, ProfilePointer } from "nostr-tools/lib/nip19";
import { guessMimeType } from "./guessMimeType";
import { findLinks, Link } from "./findLinks";

export type Reference = {
	text: string;
	profile?: ProfilePointer;
	event?: EventPointer;
	address?: AddressPointer;
};

export type ContentToken = {
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

export function getNoteContentTokens(content: string, references: Reference[]): ContentToken[] {
	const tokens: ContentToken[] = [];

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

			const mimeType = guessMimeType(link.href);

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

	tokens.push({
		type: 'string',
		string: unparsedContent,
	});

	return tokens.filter(token => !(token.type === 'reference' && token.reference === fakeFinalReference));
}