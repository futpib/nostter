import { getProfileDisplayNameText } from "@/utils/getProfileDisplayNameText";
import { PubkeyMetadata } from "@/utils/renderNoteContent";
import { DateTime } from "luxon";
import { NextSeo } from "next-seo";
import { ProfileContactsTabs } from "./ProfileContactsTabs";
import { ProfileFollowingList } from "./ProfileFollowingList";
import { ProfileHeader } from "./ProfileHeader";

export function ProfileFollowingPage({
	pubkey,
	pubkeyMetadata,
	now,
}: {
	pubkey: string;
	pubkeyMetadata: undefined | PubkeyMetadata;
	now?: string | DateTime;
}) {
	const pubkeyText = getProfileDisplayNameText({
		pubkey,
		pubkeyMetadatas: pubkeyMetadata ? new Map([[pubkey, pubkeyMetadata]]) : new Map(),
	});

	return (
		<>
			<NextSeo
				useAppDir
				title={`People followed by ${pubkeyText} on Nostr`}
				description={pubkeyMetadata?.about}
			/>

			<ProfileHeader
				pubkey={pubkey}
				pubkeyMetadata={pubkeyMetadata}
			/>

			<ProfileContactsTabs />

			<ProfileFollowingList
				pubkey={pubkey}
				now={now}
			/>
		</>
	);
}
