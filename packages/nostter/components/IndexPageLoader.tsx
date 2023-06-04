'use client';

import { useRouter } from "next/navigation";
import { NextSeo } from "next-seo";
import { useEffect } from "react";
import { useAccounts } from "@/hooks/useAccounts";

export function IndexPageLoader() {
	const router = useRouter();

	const { accounts, isAccountsInitialLoading } = useAccounts();

	useEffect(() => {
		if (isAccountsInitialLoading) {
			return;
		}

		if (accounts.length === 0) {
			router.push("/explore");
			return;
		}

		router.push("/home");
	}, [ accounts?.length, isAccountsInitialLoading ]);

	return (
		<>
			<NextSeo
				useAppDir
				title="Nostr"
				description="A censorship-resistant alternative to Twitter that has a chance of working"
			/>
		</>
	);
}
