import { getPublicRuntimeConfig } from "@/utils/getPublicRuntimeConfig";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { EventPointer } from "nostr-tools/lib/nip19";
import { useMemo } from "react";

type Data = { events: Event[] };

export function useRepostNotesQuery(
	{
		eventPointer,
	}: {
		eventPointer: undefined | EventPointer;
	},
	options?: UseQueryOptions<Data>,
) {
	const { publicUrl } = getPublicRuntimeConfig();

	const repostNotesUrl = useMemo(() => {
		if (!eventPointer?.id) {
			return undefined;
		}

		const url = new URL(`${publicUrl}/api/event/${eventPointer.id}/reposts`);

		for (const relay of (eventPointer.relays ?? [])) {
			url.searchParams.append('relays', relay);
		}

		return url.toString();
	}, [ eventPointer, publicUrl ]);

	const repostNotesQuery = useQuery<Data>([ repostNotesUrl ], async () => {
		if (!repostNotesUrl) {
			return { events: [] };
		}

		return fetch(repostNotesUrl).then((response) => response.json())
	}, {
		...options,
		enabled: Boolean(repostNotesUrl) && options?.enabled !== false,
	});

	return repostNotesQuery;
}
