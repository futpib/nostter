import { AllNotes } from "@/components/AllNotes";
import { HomePageLoader } from "@/components/HomePageLoader";
import { NextSeo } from "next-seo";
import { headers } from "next/headers";

export default async function HomePage() {
	const headerList = headers();

	if (headerList.has('referer')) {
		return (
			<HomePageLoader />
		);
	}

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
