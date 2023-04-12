import { nip19 } from "nostr-tools";
import { PubkeyMetadata } from "./renderNoteContent";

export function getProfileAnyNameText({
	pubkey,
	pubkeyMetadatas,
}: {
	pubkey: string;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
}) {
	const notePubkeyMetadata = pubkeyMetadatas.get(pubkey);
	const notePubkeyDisplayName = notePubkeyMetadata?.display_name;
	const notePubkeyName = notePubkeyMetadata?.name;

	const pubkeyText = (
		notePubkeyDisplayName ? (
			notePubkeyDisplayName
		) : (
			notePubkeyName
				? `@${notePubkeyName}`
				: nip19.npubEncode(pubkey).slice(0, 12)
		)
	);

	return pubkeyText;
}
