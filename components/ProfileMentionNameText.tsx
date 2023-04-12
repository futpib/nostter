import { getProfileMentionNameText } from "@/utils/getProfileMentionNameText";
import { PubkeyMetadata } from "@/utils/renderNoteContent";

export function ProfileMentionNameText({
	pubkey,
	pubkeyMetadatas,
}: {
	pubkey: string;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
}) {
	return (
		<>
			{getProfileMentionNameText({
				pubkey,
				pubkeyMetadatas,
			})}
		</>
	);
}
