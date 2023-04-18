import { getConfig } from "./getConfig";

export function getPublicRuntimeConfig() {
	return getConfig().publicRuntimeConfig;
}
