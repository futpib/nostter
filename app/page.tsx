import { AllNotes } from "@/components/AllNotes";
import { HomePageLoader } from "@/components/HomePageLoader";
import { shouldSkipServerRendering } from "@/utils/shouldSkipServerRendering";
import { NextSeo } from "next-seo";
import { headers } from "next/headers";

export default async function HomePage({ searchParams }: { searchParams: Record<string, unknown> }) {
	if (shouldSkipServerRendering(headers(), searchParams)) {
		return (
			<HomePageLoader />
		);
	}

	return (
		<>
			<NextSeo
				useAppDir
				title="Nostr"
				description="A censorship-resistant alternative to Twitter that has a chance of working"
			/>

			<AllNotes />
		</>
	);
}
