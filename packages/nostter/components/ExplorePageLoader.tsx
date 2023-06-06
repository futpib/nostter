'use client';

import { NextSeo } from "next-seo";
import { AllNotes } from "@/components/AllNotes";

export function ExplorePageLoader() {
	return (
		<>
			<NextSeo
				useAppDir
				title="Explore"
				description="A censorship-resistant alternative to Twitter that has a chance of working"
			/>

			<AllNotes />
		</>
	);
}
