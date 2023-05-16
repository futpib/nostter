'use client';

import { SearchInput } from "./SearchInput";
import styles from './SearchForm.module.css';
import { FormEvent, useCallback, useState } from "react";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";

export function SearchForm() {
	const [ search, setSearch ] = useState('');

	const selectedLayoutSegment = useSelectedLayoutSegment();
	const router = useRouter();

	const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		router.push('/search?' + new URLSearchParams({ q: search }));
	}, [ search ]);

	return (
		<form
			className={styles.searchForm}
			onSubmit={handleSubmit}
		>
			<SearchInput
				value={search}
				onChange={setSearch}
			/>
		</form>
	);
}
