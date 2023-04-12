import { getProfileDisplayNameText } from "@/utils/getProfileDisplayNameText";
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
			{getProfileDisplayNameText({
				pubkey,
				pubkeyMetadatas,
			})}
		</>
	);
}
