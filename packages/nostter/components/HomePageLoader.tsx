'use client';

import { useAccounts } from "@/hooks/useAccounts";
import { NextSeo } from "next-seo";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProfileContactsNotes } from "./ProfileContactsNotes";

export function HomePageLoader() {
	const { primaryAccount, isAccountsInitialLoading } = useAccounts();

	const router = useRouter();

	useEffect(() => {
		if (!isAccountsInitialLoading && !primaryAccount) {
			router.push('/sign-in');
		}
	}, [isAccountsInitialLoading, primaryAccount, router]);

	return (
		<>
			<NextSeo
				useAppDir
				title="Home"
				description="A censorship-resistant alternative to Twitter that has a chance of working"
			/>

			{primaryAccount && (
				<ProfileContactsNotes
					pubkey={primaryAccount.pubkey}
				/>
			)}
		</>
	);
}
