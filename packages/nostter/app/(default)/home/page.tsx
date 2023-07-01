import { HomePageLoader } from "@/components/HomePageLoader";
import { NextSeo } from "next-seo";

export default async function HomePage() {
	return (
		<>
			<NextSeo
				useAppDir
				title="Home"
				description="A censorship-resistant alternative to Twitter that has a chance of working"
			/>

			<HomePageLoader />
		</>
	);
}
