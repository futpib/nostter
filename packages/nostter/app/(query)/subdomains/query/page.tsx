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
		? Buffer.from(qBase64, 'base64').toString('utf-8')
		: defaultQueryString
	);

	const q = Buffer.from(query, 'utf-8').toString('base64');

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
