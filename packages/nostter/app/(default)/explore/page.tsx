import { AllNotes } from "@/components/AllNotes";
import { ExplorePageLoader } from "@/components/ExplorePageLoader";
import { getNow } from "@/utils/getNow";
import { shouldSkipServerRendering } from "@/utils/shouldSkipServerRendering";
import { NextSeo } from "next-seo";
import { headers } from "next/headers";

export default async function ExplorePage({ searchParams }: { searchParams: Record<string, unknown> }) {
	if (shouldSkipServerRendering(headers(), searchParams)) {
		return (
			<ExplorePageLoader />
		);
	}

	const now = getNow({ searchParams });

	return (
		<>
			<NextSeo
				useAppDir
				title="Explore"
				description="A censorship-resistant alternative to Twitter that has a chance of working"
			/>

			<AllNotes
				now={now}
			/>
		</>
	);
}
