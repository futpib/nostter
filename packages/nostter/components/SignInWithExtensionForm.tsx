'use client';

import { useSignInWithExtensionForm } from "@/hooks/useSignInWithExtensionForm";
import { Button } from "./Button";

export function SignInWithExtensionForm() {
	const {
		extensionSignInDisabled,
		handleExtensionSignInClick,
	} = useSignInWithExtensionForm();

	return (
		<Button
			disabled={extensionSignInDisabled}
			onClick={handleExtensionSignInClick}
		>
			Sign in with extension
		</Button>
	);
}
