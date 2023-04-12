'use client';

import Link from "next/link";
import { ReactNode, useCallback, useState } from "react";
import { nip19 } from "nostr-tools";
import styles from "./ProfileLink.module.css";
import { autoPlacement, offset, useFloating, useHover, useInteractions } from "@floating-ui/react";
import { ProfileTooltipContent } from "./ProfileTooltipContent";
import { ProfileLoader } from "./ProfileLoader";

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

	const [ isTooltipOpen, setIsTooltipOpen ] = useState(false);

	const { x, y, strategy, refs, context } = useFloating({
		open: isTooltipOpen,
		onOpenChange: setIsTooltipOpen,
		middleware: [ autoPlacement(), offset(16) ],
	});

	const hover = useHover(context, {
		delay: 500,
	});

	const { getReferenceProps, getFloatingProps } = useInteractions([
		hover,
	]);

	return (
		<>
			<Link
				ref={refs.setReference}
				className={unstyled ? undefined : styles.profileLink}
				href={`/${nip19.npubEncode(pubkey)}`}
				onClick={handleProfileLinkClick}
				{...getReferenceProps()}
			>
				{children}
			</Link>

			{isTooltipOpen && (
				<div
					ref={refs.setFloating}
					style={{
						position: strategy,
						top: y ?? 0,
						left: x ?? 0,
					}}
					className={styles.profileTooltip}
					{...getFloatingProps()}
				>
					<ProfileLoader
						profilePointer={{ pubkey }}
						componentKey="ProfileTooltipContent"
					/>
				</div>
			)}
		</>
	);
}
