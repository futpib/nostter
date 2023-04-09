import { PubkeyMetadata } from "@/utils/renderNoteContent";
import { NextSeo } from "next-seo";
import { nip19 } from "nostr-tools";
import { Profile } from "./Profile";

export function ProfilePage({
	pubkey,
	pubkeyMetadata,
}: {
	pubkey: string;
	pubkeyMetadata: undefined | PubkeyMetadata;
}) {
	const pubkeyText = (
		pubkeyMetadata?.display_name ? (
			pubkeyMetadata?.display_name
		) : (
			pubkeyMetadata?.name
			? `@${pubkeyMetadata.name}`
			: nip19.npubEncode(pubkey)
		)
	);

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
		</>
	);
}
