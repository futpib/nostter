'use client';

import { NextSeo } from "next-seo";
import { AllNotes } from "@/components/AllNotes";

export function HomePageLoader() {
	return (
		<>
			<NextSeo
				useAppDir
				title="Nostter"
				description="A censorship-resistant alternative to Twitter that has a chance of working"
			/>

			<AllNotes />
		</>
	);
}
