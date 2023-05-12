import { useScrollSpyStatus } from "./useScrollSpyStatus";

export function useHeavyQueriesEnabled() {
	const { scrollStatus } = useScrollSpyStatus();

	return {
		heavyQueriesEnabled: scrollStatus === "VISIBLE" || scrollStatus === "OVERSCAN",
	};
}
