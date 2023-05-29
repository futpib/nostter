import { SignInForm } from "@/components/SignInForm";
import { NextSeo } from "next-seo";

export default async function SignInPage() {
	return (
		<>
			<NextSeo
				useAppDir
				title="Sign in to Nostr"
				description="A censorship-resistant alternative to Twitter that has a chance of working"
			/>

			<SignInForm />
		</>
	);
}
