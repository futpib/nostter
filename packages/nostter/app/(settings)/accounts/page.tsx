import { AccountsForm } from "@/components/AccountsForm";
import { NextSeo } from "next-seo";

export default async function AccountsPage() {
	return (
		<>
			<NextSeo
				useAppDir
				title="Accounts"
				description="A censorship-resistant alternative to Twitter that has a chance of working"
			/>

			<AccountsForm />
		</>
	);
}
