import { EventPointer } from "nostr-tools/lib/nip19";
import { trpcReact } from "@/clients/trpc";
import { EventSet } from "@/nostr/EventSet";

export function useNoteEventQuery(
	{
		eventPointer,
	}: {
		eventPointer: undefined | EventPointer;
	},
	options?: {
		enabled?: boolean;
		onSuccess?: (data: EventSet) => void;
	},
) {
	const { id, author, relays } = eventPointer ?? {};

	return trpcReact.nostr.event.useQuery({
		id: id ?? "",
		author,
		relays: relays?.sort(),
	}, {
		...options,
		enabled: Boolean(id) && options?.enabled !== false,
	});
}
