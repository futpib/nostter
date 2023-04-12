import { PubkeyMetadata } from "@/utils/renderNoteContent";
import { ProfileMentionNameText } from "./ProfileMentionNameText";
import { ProfileLink } from "./ProfileLink";

export function ProfileMentionNameTextLink({
	pubkey,
	pubkeyMetadatas,
}: {
	pubkey: string;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
}) {
	return (
		<ProfileLink pubkey={pubkey}>
			<ProfileMentionNameText
				pubkey={pubkey}
				pubkeyMetadatas={pubkeyMetadatas}
			/>
		</ProfileLink>
	);
}
