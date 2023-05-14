import { Query } from "@/components/Query";
import { NextSeo } from "next-seo";
import { defaultQueryString } from "@/constants/defaultQueryString";

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

	const q = btoa(query);

	return (
		<>
			<NextSeo
				useAppDir
				title="Query"
				description={query.replaceAll(/\s+/g, " ")}
				openGraph={{
					images: [
						{
							url: `/api/query/${q}/image`,
							secureUrl: `/api/query/${q}/image`,
							width: 1200,
							height: 600,
						},
					],
				}}
				twitter={{
					cardType: 'summary_large_image',
				}}
			/>

			<Query />
		</>
	);
}
