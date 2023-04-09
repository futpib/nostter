import { EventPointer } from "nostr-tools/lib/nip19";
import { UseAppQueryOptions, useAppQuery } from "./useAppQuery";

export function useNoteEventQuery(
	{
		eventPointer,
	}: {
		eventPointer: undefined | EventPointer;
	},
	options?: UseAppQueryOptions,
) {
	return useAppQuery([
		'finite',
		'auto',
		'nostr',
		eventPointer,
		'event',
		eventPointer?.id,
	], {
		...options,
		enabled: Boolean(eventPointer) && options?.enabled !== false,
	});
}
