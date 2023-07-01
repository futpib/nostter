import { trpcReact } from "@/clients/trpc";
import { startOf } from "@/luxon";
import { EventKind } from "@/nostr/EventKind";
import { EventSet } from "@/nostr/EventSet";
import { Cursor } from "@/trpc/router/nostr";
import { InfiniteData } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { EventPointer } from "nostr-tools/lib/nip19";
import { useMemo } from "react";
import { useNow } from "./useNow";

export function useDescendantNotesQuery(
	{
		eventPointer,
		now: propsNow,
	}: {
		eventPointer: undefined | EventPointer;
		now?: string | DateTime;
	},
	{
		enabled = true,
		onSuccess,
	}: {
		enabled?: boolean;
		onSuccess?: (data: InfiniteData<{ eventSet: EventSet; nextCursor?: Cursor }>) => void;
	} = {},
) {
	const now = useNow({ propsNow });

	const nowRounded = useMemo(() => startOf(now, '5minutes'), [ now ]);

	const input = useMemo(() => ({
		kinds: [ EventKind.Text ],
		referencedEventIds: eventPointer ? [ eventPointer.id ] : [],
	}), [ eventPointer?.id ]);

	const initialCursor = useMemo(() => ({
		until: nowRounded.toSeconds(),
		limit: 64,
	}), [ nowRounded ]);

	const {
		data,
		isFetching,
		hasNextPage,
		fetchNextPage,
	} = trpcReact.nostr.eventsInfinite.useInfiniteQuery(input, {
		enabled: Boolean(eventPointer) && enabled !== false,

		initialCursor,

		getNextPageParam(lastPage) {
			return lastPage.nextCursor;
		},

		onSuccess,
	});

	return {
		data,
		isFetching,
		hasNextPage,
		fetchNextPage,
	};
}
