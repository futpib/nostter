'use client';

import { NextSeo } from "next-seo";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { SearchNotes } from "./SearchNotes";

export function SearchPageLoader() {
	const searchParams = useSearchParams();

	const q = searchParams?.get('q');

	const query = useMemo(() => {
		if (typeof q !== 'string') {
			return '';
		}

		return q;
	}, [q]);

	return (
		<>
			<NextSeo
				useAppDir
				title={`${query} - Nostr Search`}
			/>

			<SearchNotes
				query={query}
			/>
		</>
	);
}
