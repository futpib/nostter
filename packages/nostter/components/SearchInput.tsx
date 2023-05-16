'use client';

import { ChangeEvent, useCallback } from 'react';
import styles from './SearchInput.module.css';

export function SearchInput({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.value);
	}, [ onChange ]);

	return (
		<input
			type="text"
			placeholder="Search Nostr"
			className={styles.searchInput}
			value={value}
			onChange={handleSearchChange}
		/>
	);
}
