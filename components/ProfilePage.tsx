import { PubkeyMetadata } from "@/utils/renderNoteContent";
import { NextSeo } from "next-seo";
import { Profile } from "./Profile";
import { ProfileNotes } from "./ProfileNotes";
import { getProfileAnyNameText } from "@/utils/getProfileAnyNameText";

export function ProfilePage({
	pubkey,
	pubkeyMetadata,
}: {
	pubkey: string;
	pubkeyMetadata: undefined | PubkeyMetadata;
}) {
	const pubkeyText = getProfileAnyNameText({
		pubkey,
		pubkeyMetadatas: pubkeyMetadata ? new Map([[pubkey, pubkeyMetadata]]) : new Map(),
	});

	return (
		<>
			<NextSeo
				useAppDir
				title={`${pubkeyText} on Nostter`}
				description={pubkeyMetadata?.about}
			/>

			<Profile
				pubkey={pubkey}
				pubkeyMetadata={pubkeyMetadata}
			/>

			<ProfileNotes
				pubkey={pubkey}
			/>
		</>
	);
}
