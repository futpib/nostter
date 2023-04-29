import { EventSet } from "@/nostr/EventSet";
import invariant from "invariant";

export function isDataEventSetEmpty(data: unknown): boolean {
	if (data instanceof EventSet) {
		return data.size === 0;
	}

	if (
		data
			&& typeof data === 'object'
			&& 'eventSet' in data
	) {
		const data_ = data as { eventSet?: unknown };
		if (data_.eventSet instanceof EventSet) {
			return data_.eventSet.size === 0;
		}
	}

	invariant(false, 'data is not an EventSet nor an infinite query result with `eventSet` property');
}
