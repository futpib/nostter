import { EventSet } from "@/nostr/EventSet";
import { Cursor } from "@/trpc/router/nostr";
import { OperationResultEnvelope } from "@trpc/client";

export type EventSetPageResult = {
	eventSet: EventSet;
	nextCursor: undefined | Cursor;
};

export function isEventSetPageResultEnvelope(
	resultEnvelope: OperationResultEnvelope<unknown>
): resultEnvelope is OperationResultEnvelope<EventSetPageResult> {
	const data = (resultEnvelope.result as any).data as unknown;

	if (
		data
			&& typeof data === 'object'
			&& 'eventSet' in data
	) {
		const data_ = data as { eventSet?: unknown };
		return data_.eventSet instanceof EventSet;
	}

	return false;
}

export function isEventSetPageResultEnvelopes(
	resultEnvelopes: OperationResultEnvelope<unknown>[]
): resultEnvelopes is OperationResultEnvelope<EventSetPageResult>[] {
	return resultEnvelopes.every(isEventSetPageResultEnvelope);
}
