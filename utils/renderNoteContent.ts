import { AddressPointer, EventPointer, ProfilePointer } from "nostr-tools/lib/nip19";
import { ReactNode } from "react";

export type PubkeyMetadata = {
	name?: string;
	about?: string;
	picture?: string;
};

export type Reference = {
	text: string;
	profile?: ProfilePointer;
	event?: EventPointer;
	address?: AddressPointer;
};

export function renderNoteContent<T extends string | ReactNode>({
	content,
	references,
	pubkeyMetadatas,
}: {
	content: string;
	references: Reference[];
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
}, {
	renderProfileReference,
}: {
	renderProfileReference: (props: {
		key: number | string;
		profilePointer: ProfilePointer;
		metadata: PubkeyMetadata;
	}) => T;
}): T[] {
	const contentChildren: T[] = [];

	let unparsedReferences = references.slice();
	let unparsedContent = content;
	let reference = unparsedReferences.shift();

	while (reference) {
		const [ beforeReference, afterReference ] = unparsedContent.split(reference.text);

		contentChildren.push(beforeReference as T);

		if (reference.profile) {
			const metadata = pubkeyMetadatas.get(reference.profile.pubkey);

			if (metadata?.name) {
				contentChildren.push(renderProfileReference({
					key: reference.text,
					profilePointer: reference.profile,
					metadata,
				}));
			} else {
				contentChildren.push(reference.text as T);
			}
		} else {
			contentChildren.push(reference.text as T);
		}

		unparsedContent = afterReference;

		reference = unparsedReferences.shift();
	}

	contentChildren.push(unparsedContent as T);

	return contentChildren;
}
