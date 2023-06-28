'use client';

import { useAccounts } from "@/hooks/useAccounts";
import { Button } from './Button';

export function FooterSmSignIn() {
	const { accounts } = useAccounts();

	return (
		<>
			{accounts.length === 0 && (
				<>
					<Button
						href="/sign-in"
					>
						Sign in
					</Button>
				</>
			)}
		</>
	);
}
