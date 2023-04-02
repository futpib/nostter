"use client";

import { DateTime } from "luxon";
import Link from "next/link";
import { nip19 } from "nostr-tools";
import { useMemo, useState } from "react";
import styles from "./CreatedAtLink.module.css";
import { useFloating, useHover, useInteractions, offset } from "@floating-ui/react";

export function CreatedAtLink({
	long,
	id,
	createdAt,
}: {
	long?: boolean;
	id: string;
	createdAt: number;
}) {
	const tooltipText = useMemo(() => {
		return DateTime.fromSeconds(createdAt).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
	}, [createdAt]);

	const text = useMemo(() => {
		const createdAtDateTime = DateTime.fromSeconds(createdAt);

		if (long) {
			return createdAtDateTime.toLocaleString(DateTime.DATETIME_MED);
		}

		const now = DateTime.local();
		const age = now.diff(createdAtDateTime);

		if (age.as("hour") < 1) {
			return age.toFormat("m") + "m";
		} else if (age.as("day") < 1) {
			return age.toFormat("h") + "h";
		}

		if (createdAtDateTime.year === now.year) {
			return createdAtDateTime.toLocaleString({
				month: "short",
				day: "2-digit",
			});
		}

		return createdAtDateTime.toLocaleString(DateTime.DATE_MED);
	}, [long, createdAt]);

	const [ isTooltipOpen, setIsTooltipOpen ] = useState(false);

	const { x, y, strategy, refs, context } = useFloating({
		open: isTooltipOpen,
		onOpenChange: setIsTooltipOpen,
		middleware: [ offset(4) ],
	});

	const hover = useHover(context, {
		delay: {
			open: 500,
			close: 0,
		},
	});

	const { getReferenceProps, getFloatingProps } = useInteractions([
		hover,
	]);

	return (
		<>
			<Link
				ref={refs.setReference}
				className={styles.createdAtLink}
				href={`/note/${nip19.noteEncode(id)}`}
				{...getReferenceProps()}
			>
				{text}
			</Link>

			{isTooltipOpen && (
				<div
					ref={refs.setFloating}
					style={{
						position: strategy,
						top: y ?? 0,
						left: x ?? 0,
					}}
					className={styles.tooltip}
					{...getFloatingProps()}
				>
					{tooltipText}
				</div>
			)}
		</>
	);
}
