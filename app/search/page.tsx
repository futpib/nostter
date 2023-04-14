import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { NextSeo } from 'next-seo';
import { SearchPageLoader } from '@/components/SearchPageLoader';
import { SearchNotes } from '@/components/SearchNotes';

async function SearchPageServer({ query }: { query: string }) {
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

export default async function SearchPage({ searchParams: { q } }: { searchParams: { q: unknown } }) {
	if (typeof q !== 'string') {
		return notFound();
	}

	const query = q.trim();

	if (!query) {
		return redirect('/');
	}

	const headerList = headers();

	if (headerList.has('referer')) {
		return (
			<SearchPageLoader
				query={query}
			/>
		);
	}

	return SearchPageServer({
		query,
	});
}
