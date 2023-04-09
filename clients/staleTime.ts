import { FullQueryKey } from "@/hooks/useAppQuery";
import { Duration } from "luxon";

const oneMinute = Duration.fromObject({ minutes: 1 }).as('milliseconds');

export function getStaleTime(queryKey: FullQueryKey) {
	const [ preferences, backend, network, parameters, resourceType, resourceId, subresource ] = queryKey;

	if (resourceType === 'event') {
		if (!subresource) {
			return Infinity;
		}

		if (subresource === 'descendants') {
			return oneMinute;
		}

		if (subresource === 'reposts') {
			return oneMinute;
		}

		if (subresource === 'reactions') {
			return oneMinute;
		}
	}

	if (resourceType === 'pubkey') {
		if (subresource === 'metadata') {
			return oneMinute;
		}
	}

	return 0;
}
