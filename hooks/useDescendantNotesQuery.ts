import { getPublicRuntimeConfig } from "@/utils/getPublicRuntimeConfig";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { EventPointer } from "nostr-tools/lib/nip19";
import { useMemo } from "react";

type Data = { events: Event[] };

export function useDescendantNotesQuery(
	{
		eventPointer,
	}: {
		eventPointer: undefined | EventPointer;
	},
	options?: UseQueryOptions<Data>,
) {
	const { publicUrl } = getPublicRuntimeConfig();

	const descendantNotesUrl = useMemo(() => {
		if (!eventPointer?.id) {
			return undefined;
		}

		const url = new URL(`${publicUrl}/api/event/${eventPointer.id}/descendants`);

		for (const relay of (eventPointer.relays ?? [])) {
			url.searchParams.append('relays', relay);
		}

		return url.toString();
	}, [ eventPointer, publicUrl ]);

	const descendantNotesQuery = useQuery<Data>([ descendantNotesUrl ], async () => {
		if (!descendantNotesUrl) {
			return { events: [] };
		}

		return fetch(descendantNotesUrl).then((response) => response.json())
	}, {
		...options,
		enabled: Boolean(descendantNotesUrl) && options?.enabled !== false,
	});

	return descendantNotesQuery;
}
