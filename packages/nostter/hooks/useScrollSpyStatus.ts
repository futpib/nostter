import { ScrollSpyStatusContext } from "@/components/ScrollSpyStatusProvider";
import { useContext, useMemo } from "react";

export function useScrollSpyStatus() {
	const context = useContext(ScrollSpyStatusContext);

	return useMemo(() => ({
		scrollStatus: context?.scrollStatus,
	}), [context?.scrollStatus]);
}
