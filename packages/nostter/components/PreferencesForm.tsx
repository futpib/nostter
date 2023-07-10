'use client';

import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";
import styles from './PreferencesForm.module.css';

export function PreferencesForm() {
	return (
		<>
			<Link
				className={styles.listItem}
				href="/accounts"
			>
				<div className={styles.listItemContent}>
					Accounts
				</div>

				<FaChevronRight />
			</Link>

			{/* <Link
				className={styles.listItem}
				href="/relays"
				>
				<div className={styles.listItemContent}>
				Relays
				</div>

				<FaChevronRight />
				</Link> */}
		</>
	);
}
