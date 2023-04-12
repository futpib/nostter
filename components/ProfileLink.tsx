import Link from "next/link";
import { ReactNode, useCallback } from "react";
import { nip19 } from "nostr-tools";
import styles from "./ProfileLink.module.css";

export function ProfileLink({
	unstyled = false,
	pubkey,
	children,
}: {
	unstyled?: boolean;
	pubkey: string;
	children?: ReactNode;
}) {
	const handleProfileLinkClick = useCallback((event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
		event.stopPropagation();
	}, []);

	return (
		<Link
			className={unstyled ? undefined : styles.profileLink}
			href={`/${nip19.npubEncode(pubkey)}`}
			onClick={handleProfileLinkClick}
		>
			{children}
		</Link>
	);
}
