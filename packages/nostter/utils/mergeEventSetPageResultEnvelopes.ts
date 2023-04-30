import { EventSet } from "@/nostr/EventSet";
import { Cursor } from "@/trpc/router/nostr";
import { OperationResultEnvelope } from "@trpc/client";
import invariant from "invariant";
import { EventSetPageResult } from "./isEventSetPageResultEnvelope";

function latestCursor(a: Cursor, b: Cursor): Cursor {
	invariant(a.until, "a.until is undefined");
	invariant(b.until, "b.until is undefined");
	return a.until > b.until ? a : b;
}

export function mergeEventSetPageResultEnvelopes(
	resultEnvelopes: OperationResultEnvelope<EventSetPageResult>[],
): OperationResultEnvelope<EventSetPageResult> {
	let latestCursor_ = resultEnvelopes.reduce(
		(latestCursor_, resultEnvelope) => {
			invariant(resultEnvelope.result.type === 'data', "resultEnvelope.result.type !== 'data'");

			if (latestCursor_ === undefined) {
				return resultEnvelope.result.data.nextCursor;
			}

			if (resultEnvelope.result.type === 'data' && resultEnvelope.result.data.nextCursor !== undefined) {
				return latestCursor(latestCursor_, resultEnvelope.result.data.nextCursor);
			}

			return latestCursor_;
		},
		undefined as Cursor | undefined,
	);

	let eventSet = new EventSet();

	for (const resultEnvelope of resultEnvelopes) {
		invariant(resultEnvelope.result.type === 'data', "resultEnvelope.result.type !== 'data'");

		for (const event of resultEnvelope.result.data.eventSet) {
			eventSet.add(event);
		}
	}

	const extraEventSet = new EventSet();

	if (latestCursor_?.limit && eventSet.size > latestCursor_.limit) {
		const limitedEventSet = new EventSet();

		for (const event of eventSet.getEventsLatestFirst()) {
			if (limitedEventSet.size >= latestCursor_.limit) {
				extraEventSet.add(event);
			} else {
				limitedEventSet.add(event);
			}
		}

		eventSet = limitedEventSet;
	}

	const oldestEvent = eventSet.getOldestEvent();

	if (oldestEvent && latestCursor_?.until) {
		latestCursor_ = latestCursor(latestCursor_, {
			...latestCursor_,
			until: oldestEvent.created_at,
		});
	}

	return {
		result: {
			type: 'data',
			data: {
				eventSet,
				extraEventSet: extraEventSet.size > 0 ? extraEventSet : undefined,
				nextCursor: latestCursor_,
			},
		},
	};
}
