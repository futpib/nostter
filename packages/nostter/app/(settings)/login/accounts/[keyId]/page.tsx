import { LoginAccountsForm } from "@/components/LoginAccountsForm";
import { NextSeo } from "next-seo";

export default async function LoginAccountsPage() {
	return (
		<>
			<NextSeo
				useAppDir
				title="Log in to Nostr"
				description="A censorship-resistant alternative to Twitter that has a chance of working"
			/>

			<LoginAccountsForm />
		</>
	);
}
