import { getPublicRuntimeConfig } from "@/utils/getPublicRuntimeConfig";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { EventPointer } from "nostr-tools/lib/nip19";
import { useMemo } from "react";

type Data = { event?: Event };

export function useNoteEventQuery(
	{
		eventPointer,
	}: {
		eventPointer: undefined | EventPointer;
	},
	options?: UseQueryOptions<Data>,
) {
	const { publicUrl } = getPublicRuntimeConfig();

	const noteEventUrl = useMemo(() => {
		if (!eventPointer?.id) {
			return undefined;
		}

		const url = new URL(`${publicUrl}/api/event/${eventPointer.id}`);

		for (const relay of (eventPointer.relays ?? [])) {
			url.searchParams.append('relays', relay);
		}

		return url.toString();
	}, [ eventPointer, publicUrl ]);

	const noteEventQuery = useQuery<Data>([ noteEventUrl ], async () => {
		if (!noteEventUrl) {
			return { events: [] };
		}

		return fetch(noteEventUrl).then((response) => response.json())
	}, {
		...options,
		enabled: Boolean(noteEventUrl) && options?.enabled !== false,
	});

	return noteEventQuery;
}
