import { getPublicRuntimeConfig } from "@/utils/getPublicRuntimeConfig";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { EventPointer } from "nostr-tools/lib/nip19";
import { useMemo } from "react";

type Data = { events: Event[] };

export function useReactionsQuery(
	{
		eventPointer,
	}: {
		eventPointer: undefined | EventPointer;
	},
	options?: UseQueryOptions<Data>,
) {
	const { publicUrl } = getPublicRuntimeConfig();

	const reactionsUrl = useMemo(() => {
		if (!eventPointer?.id) {
			return undefined;
		}

		const url = new URL(`${publicUrl}/api/event/${eventPointer.id}/reactions`);

		for (const relay of (eventPointer.relays ?? [])) {
			url.searchParams.append('relays', relay);
		}

		return url.toString();
	}, [ eventPointer, publicUrl ]);

	const reactionsQuery = useQuery<Data>([ reactionsUrl ], async () => {
		if (!reactionsUrl) {
			return { events: [] };
		}

		return fetch(reactionsUrl).then((response) => response.json())
	}, {
		...options,
		enabled: Boolean(reactionsUrl) && options?.enabled !== false,
	});

	return reactionsQuery;
}
