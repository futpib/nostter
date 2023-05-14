import { defaultQueryString, Query } from "@/components/Query";
import { NextSeo } from "next-seo";

export default async function QueryPage({
	searchParams,
}: {
	searchParams: Record<string, unknown>;
}) {
	const { q: qBase64 } = searchParams;

	const query = (
		typeof qBase64 === "string"
		? atob(qBase64)
		: defaultQueryString
	);

	return (
		<>
			<NextSeo
				useAppDir
				title="Query"
				description={query}
			/>

			<Query />
		</>
	);
}
