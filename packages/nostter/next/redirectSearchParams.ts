import { RedirectType } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";

export function redirectSearchParams(url: string, searchParams: Record<string, unknown>, type?: RedirectType): never {
	const searchParamsString = new URLSearchParams(searchParams as Record<string, string>).toString();

	const redirectUrl = `${url}?${searchParamsString}`;

	return redirect(redirectUrl, type);
}
