import { notFound } from 'next/navigation';
import { Event, nip19, parseReferences } from 'nostr-tools';
import { NextSeo } from 'next-seo';
import { Note } from '@/components/Note';
import { EVENT_KIND_METADATA } from '@/constants/eventKinds';
import { PubkeyMetadata, renderNoteContent } from '@/utils/renderNoteContent';
import { publicUrl } from '@/environment/publicUrl';

export default async function NotePage({ params: { nip19Id: nip19IdParam } }: { params: { nip19Id: unknown } }) {
	if (typeof nip19IdParam !== "string") {
		notFound();
	}

	const nip19Id = nip19.decode(nip19IdParam);

	if (nip19Id.type !== "note" || typeof nip19Id.data !== 'string') {
		notFound();
	}

	const { event: noteEvent }: { event: Event } = await fetch(`${publicUrl}/api/event/${nip19Id.data}`).then((response) => response.json());

	if (!noteEvent) {
		notFound();
	}

	const references = parseReferences(noteEvent);

	const referencedPubkeys = [
		noteEvent.pubkey,
		...references.flatMap((reference) => reference.profile ? [ reference.profile.pubkey ] : []),
	];

	const pubkeyMetadataEvents = await Promise.all(referencedPubkeys.map(async (pubkey): Promise<{ event?: Event }> => {
		const response = await fetch(`${publicUrl}/api/pubkey/${pubkey}/metadata`);

		if (response.status === 404) {
			return {};
		}

		return response.json();
	}));

	const pubkeyMetadatas = pubkeyMetadataEvents.reduce((map, { event }) => {
		if (event?.kind !== EVENT_KIND_METADATA) {
			return map;
		}

		let pubkeyMetadata: PubkeyMetadata = {};

		try {
			pubkeyMetadata = JSON.parse(event.content);
		} catch (error) {
			if (error instanceof SyntaxError) {
				console.error('Failed to parse metadata', event);
			} else {
				throw error;
			}
		}

		map.set(event.pubkey, pubkeyMetadata);

		return map;
	}, new Map<string, PubkeyMetadata>());

	const { contentChildren } = renderNoteContent({
		content: noteEvent.content,
		references,
		pubkeyMetadatas,
	}, {
		renderProfileReference: ({ metadata }) => `@${metadata.name}`,
		renderLink: ({ link }) => link.value,
	});

	const contentText = contentChildren.join('');

	console.dir({ noteEvent, references, pubkeyMetadatas }, { depth: null });

	const notePubkeyMetadata = pubkeyMetadatas.get(noteEvent.pubkey);
	const notePubkeyDisplayName = notePubkeyMetadata?.display_name;
	const notePubkeyName = notePubkeyMetadata?.name;

	const pubkeyText = (
		notePubkeyDisplayName ? (
			notePubkeyDisplayName
		) : (
			notePubkeyName
			? `@${notePubkeyName}`
			: nip19.npubEncode(noteEvent.pubkey)
		)
	);

	return (
		<>
			<NextSeo
				useAppDir
				title={`${pubkeyText} on Nostter: ${contentText}`}
				description={contentText}
				openGraph={{
					title: pubkeyText,
				}}
			/>

			<Note
				pubkey={noteEvent.pubkey}
				content={noteEvent.content}
				createdAt={noteEvent.created_at}
				references={references}
				pubkeyMetadatas={pubkeyMetadatas}
			/>
		</>
	);
}
