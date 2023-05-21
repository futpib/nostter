import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Event, parseReferences } from 'nostr-tools';
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
import { ProfileNotes } from '@/components/ProfileNotes';
import { getProfileDisplayNameText } from '@/utils/getProfileDisplayNameText';
import { getProfileMentionNameText } from '@/utils/getProfileMentionNameText';
import { shouldSkipServerRendering } from '@/utils/shouldSkipServerRendering';
import { DateTime } from 'luxon';
import { getContentPageLinks } from '@/utils/getContentPageLinks';
import invariant from 'invariant';
import { getNoteContentTokens } from '@/utils/getNoteContentTokens';
import { toEventPointer } from '@/utils/toEventPointer';
import { parsePageLinkMetadatas } from '@/utils/parsePageLinkMetadatas';
import { createTRPCCaller } from '@/trpc/backend';
import { getNow } from '@/utils/getNow';
import { getTagsImageLinks } from '@/utils/getTagsImageLinks';
import { getTagsVideoLinks } from '@/utils/getTagsVideoLinks';

const log = debugExtend('pages', 'Nip19IdPage');

async function Nip19IdProfilePage({
	profilePointer,
	now,
}: {
	profilePointer: ProfilePointer,
	now: undefined | DateTime,
}) {
	const { publicUrl } = getPublicRuntimeConfig();

	const pubkeyMetadataResponse = await fetch(`${publicUrl}/api/pubkey/${profilePointer.pubkey}/metadata`);

	const { event: pubkeyMetadataEvent }: { event: Event } = await pubkeyMetadataResponse.json();

	const pubkeyMetadatas = parsePubkeyMetadataEvents([ pubkeyMetadataEvent ]);

	const pubkeyMetadata = pubkeyMetadatas.get(profilePointer.pubkey);

	const pubkeyText = getProfileDisplayNameText({
		pubkey: profilePointer.pubkey,
		pubkeyMetadatas,
	});

	const pubkeyImageUrl = pubkeyMetadata?.picture ?? pubkeyMetadata?.banner

	return (
		<>
			<NextSeo
				useAppDir
				title={`${pubkeyText} on Nostr`}
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

			<ProfileNotes
				pubkey={profilePointer.pubkey}
				now={now?.toISO() ?? undefined}
			/>
		</>
	);
}

async function Nip19IdNotePage({ eventPointer }: { eventPointer: EventPointer }) {
	const trpcCaller = await createTRPCCaller();

	const noteEventSet = await trpcCaller.nostr.event(toEventPointer(eventPointer));

	const noteEvent = noteEventSet.toEvent();

	if (!noteEvent) {
		notFound();
	}

	const references = parseReferences(noteEvent);

	const tagsImageLinks = getTagsImageLinks(noteEvent.tags);
	const tagsVideoLinks = getTagsVideoLinks(noteEvent.tags);

	const contentTokens = getNoteContentTokens(noteEvent.content, references);

	const contentImageLinks = getContentImageLinks(contentTokens);
	const contentVideoLinks = getContentVideoLinks(contentTokens);
	const contentPageLinks = getContentPageLinks(contentTokens);

	invariant(contentPageLinks.length <= 1, 'Only one page link is supported');

	const contentReferencedEvents = getContentReferencedEvents(contentTokens);

	const thread = getThread(noteEvent, {
		contentReferencedEvents,
	});

	const [
		pageLinkMetadataResponses,

		pubkeyMetadataEventResponses,
	] = await Promise.all([
		Promise.all(contentPageLinks.map(({ url }) => trpcCaller.page.metadata({ url }))),

		Promise.all(getPubkeyMetadataRequests(noteEvent).map(async (request): Promise<{ event?: Event }> => {
			const t0 = performance.now();
			const response = await fetch(request);
			log('fetch', request, performance.now() - t0);

			if (response.status === 404) {
				return {};
			}

			return response.json();
		})),
	]);

	const pubkeyMetadatas = parsePubkeyMetadataEvents(pubkeyMetadataEventResponses.flatMap(r => r.event ? [ r.event ] : []));

	const { contentChildren } = renderNoteContent({
		content: noteEvent.content,
		references,
	}, {
		renderEventReference: () => '',
		renderProfileReference: ({ profilePointer }) => getProfileMentionNameText({
			pubkey: profilePointer.pubkey,
			pubkeyMetadatas,
		}),
		renderLink: ({ token: { link } }) => link.value,
	});

	const contentText = contentChildren.join('');

	const pageLinkMetadatas = parsePageLinkMetadatas(pageLinkMetadataResponses);

	const pubkeyText = getProfileDisplayNameText({
		pubkey: noteEvent.pubkey,
		pubkeyMetadatas,
	});

	const { repliedProfilePointers } = getReferencedProfiles(noteEvent);

	return (
		<>
			<NextSeo
				useAppDir
				title={`${pubkeyText} on Nostr: ${contentText}`}
				description={contentText}
				openGraph={{
					title: pubkeyText,
					images: [...tagsImageLinks, ...contentImageLinks].map((imageLink) => ({
						url: imageLink.url,
						secureUrl: imageLink.secureUrl,
						type: imageLink.type,
					})),
					videos: [...tagsImageLinks, ...contentVideoLinks].map((videoLink) => ({
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
					tagsImageLinks={tagsImageLinks}
					tagsVideoLinks={tagsVideoLinks}
					contentImageLinks={contentImageLinks}
					contentVideoLinks={contentVideoLinks}
					contentPageLinks={contentPageLinks}
					contentReferencedEvents={contentReferencedEvents}
					createdAt={noteEvent.created_at}
					references={references}
					repliedProfilePointers={repliedProfilePointers}
					pubkeyMetadatas={pubkeyMetadatas}
					pageLinkMetadatas={pageLinkMetadatas}
				/>

				<NoteChildNotes
					id={noteEvent.id}
				/>
			</div>
		</>
	);
}

export default async function Nip19IdPage({
	params: {
		nip19Id: nip19IdParam,
		rest: restParams,
	},
	searchParams,
}: {
	params: {
		nip19Id: unknown;
		rest: unknown;
	};
	searchParams: Record<string, unknown>;
}) {
	if (shouldSkipServerRendering(headers(), searchParams)) {
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

	const now = getNow({ searchParams });

	if (decoded.type === 'profilePointer') {
		return Nip19IdProfilePage({ profilePointer: decoded.profilePointer, now });
	}

	return Nip19IdNotePage({ eventPointer: decoded.eventPointer });
}
