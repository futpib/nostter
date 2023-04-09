import { PubkeyMetadata } from "@/utils/renderNoteContent";

export function ProfileMetadata({
	pubkeyMetadata,
}: {
	pubkeyMetadata: undefined | PubkeyMetadata;
}) {
	return (
		<>
			TODO: {JSON.stringify(pubkeyMetadata)}
		</>
	);
}
