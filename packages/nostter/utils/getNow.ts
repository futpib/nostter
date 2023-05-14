import { DateTime } from "luxon";

export function getNow({
	searchParams,
}: {
	searchParams: Record<string, unknown>;
}) {
	const nowParam = typeof searchParams.now === 'string' ? searchParams.now : undefined;
	const now = DateTime.fromISO(nowParam ?? '');

	if (now.isValid) {
		return now;
	}

	return undefined;
}
