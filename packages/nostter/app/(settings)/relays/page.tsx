import { RelaysForm } from "@/components/RelaysForm";
import { NextSeo } from "next-seo";

export default async function RelaysPage() {
	return (
		<>
			<NextSeo
				useAppDir
				title="Relays"
				description="A censorship-resistant alternative to Twitter that has a chance of working"
			/>

			<RelaysForm />
		</>
	);
}
