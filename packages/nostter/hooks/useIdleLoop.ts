import { Duration } from "luxon";
import { useEffect } from "react";

export function useIdleLoop(callback: () => void, {
	enabled,
	timeout = Duration.fromObject({ years: 1 }).as('milliseconds'),
}: {
	enabled: boolean;
	timeout?: number;
}) {
	useEffect(() => {
		if (!enabled) {
			return;
		}

		let idleCallback: number;

		const idleLoop = () => {
			idleCallback = requestIdleCallback(() => {
				callback();
				idleLoop();
			}, { timeout });
		};

		idleLoop();

		return () => {
			cancelIdleCallback(idleCallback);
		};
	}, [ callback, enabled, timeout ]);
}
