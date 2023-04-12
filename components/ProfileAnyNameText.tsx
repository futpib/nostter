import { getProfileAnyNameText } from "@/utils/getProfileAnyNameText";
import { PubkeyMetadata } from "@/utils/renderNoteContent";

export function ProfileAnyNameText({
	pubkey,
	pubkeyMetadatas,
}: {
	pubkey: string;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
}) {
	return (
		<>
			{getProfileAnyNameText({
				pubkey,
				pubkeyMetadatas,
			})}
		</>
	);
}
