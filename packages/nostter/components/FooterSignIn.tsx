'use client';

import { useAccounts } from "@/hooks/useAccounts";
import { SignInWithExtensionForm } from "./SignInWithExtensionForm";
import { Button } from './Button';

export function FooterSignIn() {
	const { accounts } = useAccounts();

	return (
		<>
			{accounts.length === 0 && (
				<>
					<SignInWithExtensionForm />

					<Button
						href="/sign-in"
					>
						Sign in with keys
					</Button>
				</>
			)}
		</>
	);
}
