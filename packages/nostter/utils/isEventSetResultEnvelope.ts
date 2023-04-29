import { EventSet } from "@/nostr/EventSet";
import { OperationResultEnvelope } from "@trpc/client";

export function isEventSetResultEnvelope(resultEnvelope: OperationResultEnvelope<unknown>): resultEnvelope is OperationResultEnvelope<{ data: EventSet }> {
	const data = (resultEnvelope.result as any).data as unknown;

	return data instanceof EventSet;
}

export function isEventSetResultEvelopes(resultEnvelopes: OperationResultEnvelope<unknown>[]): resultEnvelopes is OperationResultEnvelope<{ data: EventSet }>[] {
	return resultEnvelopes.every(isEventSetResultEnvelope);
}
