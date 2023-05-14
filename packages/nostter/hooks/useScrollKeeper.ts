import { ScrollKeeperContext } from "@/components/ScrollKepeerProvider";
import { useContext, useInsertionEffect, useMemo } from "react";

export function useScrollKeeper() {
	const { onBeforeReflow, onReflow } = useContext(ScrollKeeperContext);

	useInsertionEffect(() => {
		onBeforeReflow();
	}, []);

	return useMemo(() => ({
		handleReflow: onReflow,
	}), [onReflow]);
}
