
import { IndexPageLoader } from "@/components/IndexPageLoader";
import { redirectSearchParams } from "@/next/redirectSearchParams";
import { parseAccountsCookieStorage } from "@/utils/parseAccountsCookieStorage";
import { shouldSkipServerRendering } from "@/utils/shouldSkipServerRendering";
import { cookies, headers } from "next/headers";

export default async function IndexPage({ searchParams }: { searchParams: Record<string, unknown> }) {
	if (shouldSkipServerRendering(headers(), searchParams)) {
		return (
			<IndexPageLoader />
		);
	}

	const cookieStore = cookies();
	const accountsCookieValue = cookieStore.get('accounts');

	const accounts = accountsCookieValue ? parseAccountsCookieStorage(accountsCookieValue.value) : [];

	if (accounts.length === 0) {
		redirectSearchParams('/explore', searchParams);
	}

	redirectSearchParams('/home', searchParams);
}
