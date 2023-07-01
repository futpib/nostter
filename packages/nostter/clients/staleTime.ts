import { FullQueryKey } from "@/hooks/useAppQuery";
import { Duration } from "luxon";

const oneMinute = Duration.fromObject({ minutes: 1 }).as('milliseconds');

export function getStaleTime(queryKey: FullQueryKey) {
	const [ mode, preferences, backend, network, parameters, resourceType, resourceId, subresource ] = queryKey;

	if (resourceType === 'event') {
		if (!subresource) {
			return Infinity;
		}

		if (subresource === 'reposts') {
			return oneMinute;
		}
	}

	return 0;
}
