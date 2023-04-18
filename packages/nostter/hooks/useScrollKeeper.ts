import { ScrollKeeperContext } from "@/components/ScrollKepeerProvider";
import { useContext, useMemo } from "react";

export function useScrollKeeper() {
	const { onReflow } = useContext(ScrollKeeperContext);
	return useMemo(() => ({
		handleReflow: onReflow,
	}), [onReflow]);
}
