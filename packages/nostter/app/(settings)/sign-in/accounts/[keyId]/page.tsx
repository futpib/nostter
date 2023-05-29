import { SignInAccountsForm } from "@/components/SignInAccountsForm";
import { NextSeo } from "next-seo";

export default async function SignInAccountsPage() {
	return (
		<>
			<NextSeo
				useAppDir
				title="Sign in to Nostr"
				description="A censorship-resistant alternative to Twitter that has a chance of working"
			/>

			<SignInAccountsForm />
		</>
	);
}
