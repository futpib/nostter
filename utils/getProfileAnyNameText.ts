import { PubkeyMetadata } from "./renderNoteContent";
import { getProfileMentionNameText } from "./getProfileMentionNameText";

export function getProfileAnyNameText({
	pubkey,
	pubkeyMetadatas,
}: {
	pubkey: string;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
}) {
	const notePubkeyMetadata = pubkeyMetadatas.get(pubkey);
	const notePubkeyDisplayName = notePubkeyMetadata?.display_name;

	const pubkeyText = (
		notePubkeyDisplayName ? (
			notePubkeyDisplayName
		) : getProfileMentionNameText({
			pubkey,
			pubkeyMetadatas,
		})
	);

	return pubkeyText;
}
