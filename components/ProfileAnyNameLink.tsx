import { PubkeyMetadata } from "@/utils/renderNoteContent";
import Link from "next/link";
import { useCallback } from "react";
import { nip19 } from "nostr-tools";
import styles from "./ProfileAnyNameLink.module.css";
import { ProfileAnyNameText } from "./ProfileAnyNameText";

export function ProfileAnyNameLink({
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
			className={styles.profileAnyNameLink}
			href={`/${nip19.npubEncode(pubkey)}`}
			target="_blank"
			onClick={handleProfileLinkClick}
		>
			<ProfileAnyNameText
				pubkey={pubkey}
				pubkeyMetadatas={pubkeyMetadatas}
			/>
		</Link>
	);
}
