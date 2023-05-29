'use client';

import { useAccounts } from "@/hooks/useAccounts";
import { SignInWithExtensionForm } from "./SignInWithExtensionForm";

export function FooterSignIn() {
	const { accounts } = useAccounts();

	return (
		<>
			{accounts.length === 0 && (
				<>
					<SignInWithExtensionForm />
				</>
			)}
		</>
	);
}
