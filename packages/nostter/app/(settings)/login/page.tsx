import { LoginForm } from "@/components/LoginForm";
import { NextSeo } from "next-seo";

export default async function LoginPage() {
	return (
		<>
			<NextSeo
				useAppDir
				title="Log in to Nostr"
				description="A censorship-resistant alternative to Twitter that has a chance of working"
			/>

			<LoginForm />
		</>
	);
}
