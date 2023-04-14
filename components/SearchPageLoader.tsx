'use client';

import { NextSeo } from "next-seo";
import { SearchNotes } from "./SearchNotes";

export function SearchPageLoader({ query }: { query: string }) {
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
