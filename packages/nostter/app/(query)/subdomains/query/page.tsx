import { Query } from "@/components/Query";
import { NextSeo } from "next-seo";

export default async function QueryPage() {
	return (
		<>
			<NextSeo
				useAppDir
				title="Query"
			/>

			<Query />
		</>
	);
}
