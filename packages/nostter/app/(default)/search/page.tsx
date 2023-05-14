import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { NextSeo } from 'next-seo';
import { SearchPageLoader } from '@/components/SearchPageLoader';
import { SearchNotes } from '@/components/SearchNotes';
import { shouldSkipServerRendering } from '@/utils/shouldSkipServerRendering';
import { getNow } from '@/utils/getNow';
import { DateTime } from 'luxon';

async function SearchPageServer({
	query,
	now,
}: {
	query: string;
	now: undefined | DateTime;
}) {
	return (
		<>
			<NextSeo
				useAppDir
				title={`${query} - Nostr Search`}
			/>

			<SearchNotes
				query={query}
				now={now?.toISO() ?? undefined}
			/>
		</>
	);
}

export default async function SearchPage({
	searchParams,
}: {
	searchParams: Record<string, unknown>;
}) {
	const { q } = searchParams;

	if (typeof q !== 'string') {
		return notFound();
	}

	const query = q.trim();

	if (!query) {
		return redirect('/');
	}

	if (shouldSkipServerRendering(headers(), searchParams)) {
		return (
			<SearchPageLoader />
		);
	}

	const now = getNow({ searchParams });

	return SearchPageServer({ query, now });
}
