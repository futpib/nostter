import { PreferencesForm } from "@/components/PreferencesForm";
import { NextSeo } from "next-seo";

export default async function PreferencesPage() {
	return (
		<>
			<NextSeo
				useAppDir
				title="Settings"
				description="A censorship-resistant alternative to Twitter that has a chance of working"
			/>

			<PreferencesForm />
		</>
	);
}
