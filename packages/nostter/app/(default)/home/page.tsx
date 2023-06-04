import { AllNotes } from "@/components/AllNotes";
import { HomePageLoader } from "@/components/HomePageLoader";
import { getNow } from "@/utils/getNow";
import { shouldSkipServerRendering } from "@/utils/shouldSkipServerRendering";
import { NextSeo } from "next-seo";
import { headers } from "next/headers";

export default async function HomePage({ searchParams }: { searchParams: Record<string, unknown> }) {
	if (shouldSkipServerRendering(headers(), searchParams)) {
		return (
			<HomePageLoader />
		);
	}

	const now = getNow({ searchParams });

	return (
		<>
			<NextSeo
				useAppDir
				title="Home"
				description="A censorship-resistant alternative to Twitter that has a chance of working"
			/>

			<AllNotes
				now={now}
			/>
		</>
	);
}
