import { EventPointer } from "nostr-tools/lib/nip19";
import { UseAppQueryOptions, useAppQuery } from "./useAppQuery";

export function useDescendantNotesQuery(
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
		eventPointer,
		'event',
		eventPointer?.id,
		'descendants',
	], {
		...options,
		enabled: Boolean(eventPointer) && options?.enabled !== false,
	});
}
