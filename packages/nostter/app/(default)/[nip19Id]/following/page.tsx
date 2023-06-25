import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { NextSeo } from 'next-seo';
import { parsePubkeyMetadataEvents } from '@/utils/parsePubkeyMetadataEvents';
import { nip19Decode } from '@/utils/nip19Decode';
import { ProfilePointer } from 'nostr-tools/lib/nip19';
import { guessMimeType } from '@/utils/guessMimeType';
import { getProfileDisplayNameText } from '@/utils/getProfileDisplayNameText';
import { shouldSkipServerRendering } from '@/utils/shouldSkipServerRendering';
import { DateTime } from 'luxon';
import { createTRPCCaller } from '@/trpc/backend';
import { getNow } from '@/utils/getNow';
import { EventKind } from '@/nostr/EventKind';
import { startOf } from '@/luxon';
import { Nip19IdProfileFollowingPageLoader } from '@/components/Nip19IdProfileFollowingPageLoader';
import { ProfileHeader } from '@/components/ProfileHeader';
import { ProfileContactsTabs } from '@/components/ProfileContactsTabs';
import { ProfileFollowingList } from '@/components/ProfileFollowingList';

async function Nip19IdProfileFollowingPage({
	profilePointer,
	now,
}: {
	profilePointer: ProfilePointer,
	now: undefined | DateTime,
}) {
	const trpcCaller = await createTRPCCaller();

	const nowRounded = startOf(now ?? DateTime.local(), 'hour');

	const initialCursor = {
		until: nowRounded.toSeconds(),
		limit: 1,
	};

	const pubkeyMetadataEventSet = await trpcCaller.nostr.eventsInfinite({
		kinds: [
			EventKind.Metadata,
		],

		authors: [
			profilePointer.pubkey,
		],

		cursor: initialCursor,
	});

	const pubkeyMetadatas = parsePubkeyMetadataEvents([ ...pubkeyMetadataEventSet.eventSet ]);

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
				title={`People followed by ${pubkeyText} on Nostr`}
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

			<ProfileHeader
				pubkey={profilePointer.pubkey}
				pubkeyMetadata={pubkeyMetadata}
			/>

			<ProfileContactsTabs />

			<ProfileFollowingList
				pubkey={profilePointer.pubkey}
				now={now}
			/>
		</>
	);
}

export default async function Nip19IdFollowingPage({
	params: {
		nip19Id: nip19IdParam,
	},
	searchParams,
}: {
	params: {
		nip19Id: unknown;
	};
	searchParams: Record<string, unknown>;
}) {
	if (shouldSkipServerRendering(headers(), searchParams)) {
		return (
			<Nip19IdProfileFollowingPageLoader />
		);
	}

	const nip19DecodeResult = nip19Decode(nip19IdParam);

	if (!nip19DecodeResult) {
		notFound();
	}

	const { normalizedNip19Id, decoded } = nip19DecodeResult;

	if (decoded.type !== 'profilePointer') {
		redirect(`/${normalizedNip19Id}`);
	}

	if (normalizedNip19Id !== nip19IdParam) {
		redirect(`/${normalizedNip19Id}/following`);
	}

	const now = getNow({ searchParams });

	return Nip19IdProfileFollowingPage({ profilePointer: decoded.profilePointer, now });
}
