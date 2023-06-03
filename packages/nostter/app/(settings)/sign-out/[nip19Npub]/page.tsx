import { SignOutForm } from "@/components/SignOutForm";
import { NextSeo } from "next-seo";

export default async function SignOutPage() {
	return (
		<>
			<NextSeo
				useAppDir
				title="Sign out of Nostr"
				description="A censorship-resistant alternative to Twitter that has a chance of working"
			/>

			<SignOutForm />
		</>
	);
}
