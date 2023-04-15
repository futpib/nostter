import { headers } from "next/headers";

type ReadonlyHeaders = ReturnType<typeof headers>;

export function shouldSkipServerRendering(headerList: ReadonlyHeaders, searchParams: Record<string, unknown>) {
	if (searchParams['skipServerRendering'] === 'false') {
		return false;
	}

	if (searchParams['skipServerRendering'] === 'true') {
		return true;
	}

	if (headerList.has('referer')) {
		return true;
	}

	return false;
}
