import { DrawerXsStateContext } from "@/components/DrawerXsStateProvider";
import { useContext } from "react";

export function useDrawerXsState() {
	return useContext(DrawerXsStateContext);
}
