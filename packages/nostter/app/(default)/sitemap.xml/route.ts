import { EventKind } from "@/nostr/EventKind";
import { EventSet } from "@/nostr/EventSet";
import { createTRPCCaller } from "@/trpc/backend";
import { NextResponse } from "next/server";
import { nip19 } from "nostr-tools";

function* createSitemapUrl({
	loc,
	lastmod,
	changefreq,
	priority,
}: {
	loc: string;
	lastmod?: string;
	changefreq?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	priority?: number;
}): Generator<string> {
	yield '<url>';
	yield `<loc>${loc}</loc>`;

	if (lastmod) {
		yield `<lastmod>${lastmod}</lastmod>`;
	}

	if (changefreq) {
		yield `<changefreq>${changefreq}</changefreq>`;
	}

	if (priority) {
		yield `<priority>${priority}</priority>`;
	}

	yield '</url>';
}

async function* eventSetToSitemap(eventSet: EventSet): AsyncGenerator<string> {
	yield '<?xml version="1.0" encoding="utf-8"?>';
	yield '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://www.sitemaps.org/schemas/sitemap/0.9 https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">';

	const textEventIds = new Set<string>();
	const publicKeys = new Set<string>();

	for (const event of eventSet) {
		if (event.kind === EventKind.Text) {
			textEventIds.add(event.id);
		}

		publicKeys.add(event.pubkey);

		for (const [ tagKind, tagValue ] of event.tags) {
			if (tagKind === 'p') {
				publicKeys.add(tagValue);
			}
		}
	}

	for (const textEventId of textEventIds) {
		yield* createSitemapUrl({
			loc: `https://nostter.com/${nip19.noteEncode(textEventId)}`,
			changefreq: 'daily',
		});
	}

	for (const publicKey of publicKeys) {
		yield* createSitemapUrl({
			loc: `https://nostter.com/${nip19.npubEncode(publicKey)}`,
			changefreq: 'hourly',
		});
	}

	yield '</urlset>';
}

function asyncIteratorToReadableStream(iterator: AsyncIterator<string>): ReadableStream<Uint8Array> {
	const encoder = new TextEncoder();

	return new ReadableStream<Uint8Array>({
		async pull(controller) {
			const { value, done } = await iterator.next()

			if (done) {
				controller.close()
			} else {
				controller.enqueue(encoder.encode(value))
			}
		},
	})
}

export async function GET() {
	const trpcCaller = await createTRPCCaller();

	const pubkeyPreloadedEventSet = await trpcCaller.awsBackend.pubkeyPreloadedEvents({
		pubkey: '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2',
	});

	const responseBody = asyncIteratorToReadableStream(eventSetToSitemap(pubkeyPreloadedEventSet));

	return new NextResponse(responseBody, {
		headers: {
			'content-type': 'application/xml',
		},
	});
}
