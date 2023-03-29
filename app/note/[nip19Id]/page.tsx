import { notFound } from 'next/navigation';
import { SimplePool, nip19, parseReferences } from 'nostr-tools';
import WebSocket from 'isomorphic-ws';
import { NextSeo } from 'next-seo';
import { Note } from '@/components/Note';
import { EVENT_KIND_METADATA } from '@/constants/eventKinds';
import { PubkeyMetadata, renderNoteContent } from '@/utils/renderNoteContent';
import { useMemo } from 'react';

global.WebSocket = WebSocket;

const pool = new SimplePool();

const relays = [
	"wss://nostr.bitcoiner.social",
	"wss://relay.nostr.bg",
	"wss://relay.snort.social",
	"wss://relay.damus.io",
	"wss://nostr.oxtr.dev",
	"wss://nostr-pub.wellorder.net",
	"wss://nostr.mom",
	"wss://no.str.cr",
	"wss://nos.lol",

	"wss://relay.nostr.com.au",
	"wss://eden.nostr.land",
	"wss://nostr.milou.lol",
	"wss://puravida.nostr.land",
	"wss://nostr.wine",
	"wss://nostr.inosta.cc",
	"wss://atlas.nostr.land",
	"wss://relay.orangepill.dev",
	"wss://relay.nostrati.com",

	"wss://relay.nostr.band",
];

export default async function NotePage({ params: { nip19Id: nip19IdParam } }: { params: { nip19Id: unknown } }) {
	if (typeof nip19IdParam !== "string") {
		notFound();
	}

	const nip19Id = nip19.decode(nip19IdParam);

	if (nip19Id.type !== "note" || typeof nip19Id.data !== 'string') {
		notFound();
	}

	const noteEvent = await pool.get(relays, {
		ids: [ nip19Id.data ],
	});

	if (noteEvent?.id !== nip19Id.data) {
		notFound();
	}

	const references = parseReferences(noteEvent);

	const referencedPubkeys = [
		noteEvent.pubkey,
		...references.flatMap((reference) => reference.profile ? [ reference.profile.pubkey ] : []),
	];

	const pubkeyMetadataEvents = await Promise.all(referencedPubkeys.map(pubkey => pool.get(relays, {
		kinds: [ EVENT_KIND_METADATA ],
		authors: [ pubkey ],
	})));

	const pubkeyMetadatas = pubkeyMetadataEvents.reduce((map, event) => {
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

	const contentText = renderNoteContent({
		content: noteEvent.content,
		references,
		pubkeyMetadatas,
	}, {
		renderProfileReference: ({ metadata }) => `@${metadata.name}`,
	}).join('');

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
