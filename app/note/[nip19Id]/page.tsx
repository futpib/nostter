import { notFound } from 'next/navigation';
import { Event, nip19, parseReferences } from 'nostr-tools';
import { NextSeo } from 'next-seo';
import { Note } from '@/components/Note';
import { renderNoteContent } from '@/utils/renderNoteContent';
import { getPubkeyMetadataRequests } from '@/utils/getPubkeyMetadataRequests';
import { parsePubkeyMetadataEvents } from '@/utils/parsePubkeyMetadataEvents';
import { getContentImageLinks } from '@/utils/getContentImageLinks';
import { getContentReferencedEvents } from '@/utils/getContentReferencedEvents';
import { nip19DecodeNote } from '@/utils/nip19DecodeNote';
import { getContentVideoLinks } from '@/utils/getContentVideoLinks';
import { getPublicRuntimeConfig } from '@/utils/getPublicRuntimeConfig';
import { NoteParentNotes } from '@/components/NoteParentNotes';
import { NoteChildNotes } from '@/components/NoteChildNotes';
import { getThread } from '@/utils/getThread';

export default async function NotePage({ params: { nip19Id: nip19IdParam } }: { params: { nip19Id: unknown } }) {
	if (typeof nip19IdParam !== "string") {
		notFound();
	}

	const nip19Id = nip19DecodeNote(nip19.decode(nip19IdParam));

	if (!nip19Id) {
		notFound();
	}

	const { publicUrl } = getPublicRuntimeConfig();

	const eventResponse = await fetch(`${publicUrl}/api/event/${nip19Id.data}`);

	if (eventResponse.status === 404) {
		notFound();
	}

	const { event: noteEvent }: { event: Event } = await eventResponse.json();

	if (!noteEvent) {
		notFound();
	}

	const pubkeyMetadataEventResponses = await Promise.all(getPubkeyMetadataRequests(noteEvent).map(async (request): Promise<{ event?: Event }> => {
		const response = await fetch(request);

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
		renderProfileReference: ({ metadata }) => `@${metadata.name}`,
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
					pubkeyMetadatas={pubkeyMetadatas}
				/>

				<NoteChildNotes
					id={noteEvent.id}
				/>
			</div>
		</>
	);
}
