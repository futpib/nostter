import { EventPointer } from "nostr-tools/lib/nip19";
import { UseAppQueryOptions, useAppQuery } from "./useAppQuery";

export function useReactionsQuery(
	{
		eventPointer,
	}: {
		eventPointer: undefined | EventPointer;
	},
	options?: UseAppQueryOptions,
) {
	return useAppQuery([
		'auto',
		'nostr',
		{ relays: eventPointer?.relays ?? [] },
		'event',
		eventPointer?.id,
		'reactions',
	], {
		...options,
		enabled: Boolean(eventPointer) && options?.enabled !== false,
	});
}
