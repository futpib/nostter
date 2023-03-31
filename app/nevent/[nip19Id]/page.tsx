import { notFound, redirect } from 'next/navigation';
import { nip19 } from 'nostr-tools';

export default async function EventPage({ params: { nip19Id: nip19IdParam } }: { params: { nip19Id: unknown } }) {
	if (typeof nip19IdParam !== "string") {
		notFound();
	}

	const nip19Id = nip19.decode(nip19IdParam);

	if (
		nip19Id.type !== "nevent"
		|| typeof nip19Id.data !== "object"
		|| !('id' in nip19Id.data)
		|| typeof nip19Id.data.id !== "string"
	) {
		notFound();
	}

	const newNip19IdParam = nip19.noteEncode(nip19Id.data.id);

	redirect(`/note/${newNip19IdParam}`);
}
