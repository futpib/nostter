import { PubkeyMetadata } from "@/utils/renderNoteContent";
import { NextSeo } from "next-seo";
import { Profile } from "./Profile";
import { ProfileNotes } from "./ProfileNotes";
import { getProfileDisplayNameText } from "@/utils/getProfileDisplayNameText";
import { DateTime } from "luxon";

export function ProfilePage({
	pubkey,
	pubkeyMetadata,
	now,
}: {
	pubkey: string;
	pubkeyMetadata: undefined | PubkeyMetadata;
	now?: DateTime;
}) {
	const pubkeyText = getProfileDisplayNameText({
		pubkey,
		pubkeyMetadatas: pubkeyMetadata ? new Map([[pubkey, pubkeyMetadata]]) : new Map(),
	});

	return (
		<>
			<NextSeo
				useAppDir
				title={`${pubkeyText} on Nostr`}
				description={pubkeyMetadata?.about}
			/>

			<Profile
				pubkey={pubkey}
				pubkeyMetadata={pubkeyMetadata}
			/>

			<ProfileNotes
				pubkey={pubkey}
				now={now}
			/>
		</>
	);
}
