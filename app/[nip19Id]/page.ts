import { nip19DecodeNEventEventReference } from '@/utils/nip19DecodeNEventEventReference';
import { nip19DecodeNote } from '@/utils/nip19DecodeNote';
import { notFound, redirect } from 'next/navigation';
import { nip19 } from 'nostr-tools';

export default async function Nip19Page({ params: { nip19Id: nip19IdParam } }: { params: { nip19Id: unknown } }) {
	if (typeof nip19IdParam !== "string") {
		notFound();
	}

	const nip19Id = nip19.decode(nip19IdParam);

	const nip19EventReference = nip19DecodeNEventEventReference(nip19Id);

	if (nip19EventReference) {
		redirect(`/nevent/${nip19IdParam}`);
	}

	const nip19Note = nip19DecodeNote(nip19Id);

	if (nip19Note) {
		redirect(`/note/${nip19IdParam}`);
	}

	notFound();
}
