import { nip19 } from "nostr-tools";
import { PubkeyMetadata } from "./renderNoteContent";

export function getProfileMentionNameText({
	pubkey,
	pubkeyMetadatas,
}: {
	pubkey: string;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
}) {
	const notePubkeyMetadata = pubkeyMetadatas.get(pubkey);
	const notePubkeyName = notePubkeyMetadata?.name;
	const notePubkeyDisplayName = notePubkeyMetadata?.display_name;

	const pubkeyText = (
		notePubkeyName
			? `@${notePubkeyName}`
			: (
				notePubkeyDisplayName
					? `@${notePubkeyDisplayName}`
					: nip19.npubEncode(pubkey).slice(0, 12)
			)
	);

	return pubkeyText;
}
