import { PubkeyMetadata } from "@/utils/renderNoteContent";
import Link from "next/link";
import { useCallback } from "react";
import { nip19 } from "nostr-tools";
import styles from "./ProfileMentionNameLink.module.css";
import { ProfileMentionNameText } from "./ProfileMentionNameText";

export function ProfileMentionNameLink({
	pubkey,
	pubkeyMetadatas,
}: {
	pubkey: string;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
}) {
	const handleProfileLinkClick = useCallback((event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
		event.stopPropagation();
	}, []);

	return (
		<Link
			className={styles.profileMentionNameLink}
			href={`/${nip19.npubEncode(pubkey)}`}
			target="_blank"
			onClick={handleProfileLinkClick}
		>
			<ProfileMentionNameText
				pubkey={pubkey}
				pubkeyMetadatas={pubkeyMetadatas}
			/>
		</Link>
	);
}
