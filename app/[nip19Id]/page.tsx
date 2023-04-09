import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Event, nip19, parseReferences } from 'nostr-tools';
import { NextSeo } from 'next-seo';
import { Note } from '@/components/Note';
import { renderNoteContent } from '@/utils/renderNoteContent';
import { getPubkeyMetadataRequests } from '@/utils/getPubkeyMetadataRequests';
import { parsePubkeyMetadataEvents } from '@/utils/parsePubkeyMetadataEvents';
import { getContentImageLinks } from '@/utils/getContentImageLinks';
import { getContentReferencedEvents } from '@/utils/getContentReferencedEvents';
import { getContentVideoLinks } from '@/utils/getContentVideoLinks';
import { getPublicRuntimeConfig } from '@/utils/getPublicRuntimeConfig';
import { NoteParentNotes } from '@/components/NoteParentNotes';
import { NoteChildNotes } from '@/components/NoteChildNotes';
import { getThread } from '@/utils/getThread';
import { nip19Decode } from '@/utils/nip19Decode';
import { Nip19IdPageLoader } from '@/components/Nip19IdPageLoader';
import { debugExtend } from '@/utils/debugExtend';
import { getReferencedProfiles } from '@/utils/getReferencedProfiles';
import { EventPointer, ProfilePointer } from 'nostr-tools/lib/nip19';
import { guessMimeType } from '@/utils/guessMimeType';
import { Profile } from '@/components/Profile';

const log = debugExtend('pages', 'Nip19IdPage');

async function Nip19IdProfilePage({ profilePointer }: { profilePointer: ProfilePointer }) {
	const { publicUrl } = getPublicRuntimeConfig();

	const t0 = performance.now();
	const pubkeyMetadataResponse = await fetch(`${publicUrl}/api/pubkey/${profilePointer.pubkey}/metadata`);
	log('fetch pubkey metadata', performance.now() - t0);

	if (pubkeyMetadataResponse.status === 404) {
		notFound();
	}

	const { event: pubkeyMetadataEvent }: { event: Event } = await pubkeyMetadataResponse.json();

	const pubkeyMetadatas = parsePubkeyMetadataEvents([ pubkeyMetadataEvent ]);

	const pubkeyMetadata = pubkeyMetadatas.get(profilePointer.pubkey);
	const pubkeyDisplayName = pubkeyMetadata?.display_name;
	const pubkeyName = pubkeyMetadata?.name;

	const pubkeyText = (
		pubkeyDisplayName ? (
			pubkeyDisplayName
		) : (
			pubkeyName
			? `@${pubkeyName}`
			: nip19.npubEncode(profilePointer.pubkey)
		)
	);

	const pubkeyImageUrl = pubkeyMetadata?.picture ?? pubkeyMetadata?.banner

	return (
		<>
			<NextSeo
				useAppDir
				title={`${pubkeyText} on Nostter`}
				description={pubkeyMetadata?.about}
				openGraph={{
					title: pubkeyText,
					images: pubkeyImageUrl ? [ {
						url: pubkeyImageUrl,
						secureUrl: pubkeyImageUrl,
						type: guessMimeType(pubkeyImageUrl),
					} ] : undefined,
				}}
				twitter={{
					cardType: pubkeyImageUrl ? 'summary_large_image' : undefined,
				}}
			/>

			<Profile
				pubkey={profilePointer.pubkey}
				pubkeyMetadata={pubkeyMetadata}
			/>
		</>
	);
}

async function Nip19IdNotePage({ eventPointer }: { eventPointer: EventPointer }) {
	const { publicUrl } = getPublicRuntimeConfig();

	const t0 = performance.now();
	const eventResponse = await fetch(`${publicUrl}/api/event/${eventPointer.id}`);
	log('fetch event', performance.now() - t0);

	if (eventResponse.status === 404) {
		notFound();
	}

	const { event: noteEvent }: { event: Event } = await eventResponse.json();

	if (!noteEvent) {
		notFound();
	}

	const pubkeyMetadataEventResponses = await Promise.all(getPubkeyMetadataRequests(noteEvent).map(async (request): Promise<{ event?: Event }> => {
		const t0 = performance.now();
		const response = await fetch(request);
		log('fetch', request, performance.now() - t0);

		if (response.status === 404) {
			return {};
		}

		return response.json();
	}));

	const pubkeyMetadatas = parsePubkeyMetadataEvents(pubkeyMetadataEventResponses.flatMap(r => r.event ? [ r.event ] : []));

	const references = parseReferences(noteEvent);

	const { contentChildren, contentTokens } = renderNoteContent({
		content: noteEvent.content,
		references,
		pubkeyMetadatas,
	}, {
		renderEventReference: () => '',
		renderProfileReference: ({ profilePointer, metadata }) => `@${metadata?.name ?? nip19.npubEncode(profilePointer.pubkey).slice(0, 12)}`,
		renderLink: ({ link }) => link.value,
	});

	const contentImageLinks = getContentImageLinks(contentTokens);
	const contentVideoLinks = getContentVideoLinks(contentTokens);

	const contentReferencedEvents = getContentReferencedEvents(contentTokens);

	const contentText = contentChildren.join('');

	const thread = getThread(noteEvent, {
		contentReferencedEvents,
	});

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

	const { repliedProfilePointers } = getReferencedProfiles(noteEvent);

	return (
		<>
			<NextSeo
				useAppDir
				title={`${pubkeyText} on Nostter: ${contentText}`}
				description={contentText}
				openGraph={{
					title: pubkeyText,
					images: contentImageLinks.map((imageLink) => ({
						url: imageLink.url,
						secureUrl: imageLink.secureUrl,
						type: imageLink.type,
					})),
					videos: contentVideoLinks.map((videoLink) => ({
						url: videoLink.url,
						secureUrl: videoLink.secureUrl,
						type: videoLink.type,
					})),
				}}
				twitter={{
					cardType: contentImageLinks.length ? 'summary_large_image' : undefined,
				}}
			/>

			<NoteParentNotes
				id={noteEvent.id}
				root={thread.root}
				reply={thread.reply}
				contentReferencedEvents={contentReferencedEvents}
			/>

			<div style={{ minHeight: '100vh' }}>
				<Note
					id={noteEvent.id}
					pubkey={noteEvent.pubkey}
					content={noteEvent.content}
					contentImageLinks={contentImageLinks}
					contentVideoLinks={contentVideoLinks}
					contentReferencedEvents={contentReferencedEvents}
					createdAt={noteEvent.created_at}
					references={references}
					repliedProfilePointers={repliedProfilePointers}
					pubkeyMetadatas={pubkeyMetadatas}
				/>

				<NoteChildNotes
					id={noteEvent.id}
				/>
			</div>
		</>
	);
}

export default async function Nip19IdPage({ params: { nip19Id: nip19IdParam } }: { params: { nip19Id: unknown } }) {
	const headerList = headers();

	if (headerList.has('referer')) {
		return (
			<Nip19IdPageLoader />
		);
	}

	const nip19DecodeResult = nip19Decode(nip19IdParam);

	if (!nip19DecodeResult) {
		notFound();
	}

	const { normalizedNip19Id, decoded } = nip19DecodeResult;

	if (normalizedNip19Id !== nip19IdParam) {
		redirect(`/${normalizedNip19Id}`);
	}

	if (decoded.type === 'profilePointer') {
		return Nip19IdProfilePage({ profilePointer: decoded.profilePointer });
	}

	return Nip19IdNotePage({ eventPointer: decoded.eventPointer });
}
