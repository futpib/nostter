import { DateTime } from "luxon";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const globalIntervalHandlers = new Set<() => void>();

setInterval(() => {
	for (const handler of globalIntervalHandlers) {
		handler();
	}
}, 15000);

export function useNow({
	propsNow,
	live,
}: {
	propsNow?: string | DateTime;
	live?: boolean;
}) {
	const searchParams = useSearchParams();

	const searchParamsNow = searchParams?.get('now');

	const [ refreshCount, setRefreshCount ] = useState(0);

	useEffect(() => {
		if (!live) {
			return;
		}

		const handler = () => {
			setRefreshCount(count => count + 1);
		}

		globalIntervalHandlers.add(handler);

		return () => {
			globalIntervalHandlers.delete(handler);
		};
	}, [ live ]);

	return useMemo(() => {
		if (propsNow instanceof DateTime) {
			return propsNow;
		}

		if (typeof propsNow === 'string') {
			const now = DateTime.fromISO(propsNow);

			if (now.isValid) {
				return now;
			}
		}

		if (typeof searchParamsNow === 'string') {
			const now = DateTime.fromISO(searchParamsNow);

			if (now.isValid) {
				return now;
			}
		}

		return DateTime.local();
	}, [ propsNow, searchParamsNow, refreshCount ]);
}
