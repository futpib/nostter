import { DateTime } from "luxon";
import Link from "next/link";
import { nip19 } from "nostr-tools";
import { useMemo } from "react";
import styles from "./CreatedAtLink.module.css";

export function CreatedAtLink({
	long,
	id,
	createdAt,
}: {
	long?: boolean;
	id: string;
	createdAt: number;
}) {
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

	return (
		<Link
			className={styles.createdAtLink}
			href={`/note/${nip19.noteEncode(id)}`}
		>
			{text}
		</Link>
	);
}
