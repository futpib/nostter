import { notFound } from 'next/navigation';
import { SimplePool, nip19 } from 'nostr-tools';
import WebSocket from 'isomorphic-ws';
import { NextSeo } from 'next-seo';

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

	const event = await pool.get(relays, {
		ids: [ nip19Id.data ],
	});

	if (event?.id !== nip19Id.data) {
		notFound();
	}

	return (
		<>
			<NextSeo
				useAppDir
				description={event.content}
				openGraph={{
					title: event.pubkey,
				}}
			/>
			{JSON.stringify(event, null, 2)}
		</>
	);
}
