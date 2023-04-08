import { EventPointer } from "nostr-tools/lib/nip19";
import { UseAppQueryOptions, useAppQuery } from "./useAppQuery";

export function useRepostNotesQuery(
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
		'reposts',
	], {
		...options,
		enabled: Boolean(eventPointer) && options?.enabled !== false,
	});
}
