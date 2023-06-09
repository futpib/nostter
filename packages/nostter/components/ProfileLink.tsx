'use client';

import Link from "next/link";
import { ReactNode, useCallback, useState } from "react";
import styles from "./ProfileLink.module.css";
import { offset, shift, useFloating, useHover, useInteractions } from "@floating-ui/react";
import { ProfileLoader } from "./ProfileLoader";
import classNames from "classnames";
import { PubkeyMetadata } from "@/utils/renderNoteContent";
import { npubEncode } from '../utils/npubEncode';

export function ProfileLink({
	unstyled = false,
	className,
	pubkey,
	pubkeyMetadatas,
	children,
}: {
	unstyled?: boolean;
	className?: string;
	pubkey: string;
	pubkeyMetadatas?: Map<string, PubkeyMetadata>;
	children?: ReactNode;
}) {
	const handleProfileLinkClick = useCallback((event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
		event.stopPropagation();
	}, []);

	const handleProfileTooltipClick = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.stopPropagation();
	}, []);

	const [ isTooltipOpen, setIsTooltipOpen ] = useState(false);

	const { x, y, strategy, refs, context } = useFloating({
		open: isTooltipOpen,
		onOpenChange: setIsTooltipOpen,
		middleware: [ shift(), offset(16) ],
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
				className={classNames(
					unstyled ? undefined : styles.profileLink,
					className,
				)}
				href={`/${npubEncode(pubkey)}`}
				onClick={handleProfileLinkClick}
				onAuxClick={handleProfileLinkClick}
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
					onClick={handleProfileTooltipClick}
					{...getFloatingProps()}
				>
					<ProfileLoader
						profilePointer={{ pubkey }}
						pubkeyMetadatas={pubkeyMetadatas}
						componentKey="ProfileTooltipContent"
					/>
				</div>
			)}
		</>
	);
}
