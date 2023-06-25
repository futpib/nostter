import { trpcReact } from "@/clients/trpc";
import { startOf } from "@/luxon";
import { EventKind } from "@/nostr/EventKind";
import { EventSet } from "@/nostr/EventSet";
import { DateTime } from "luxon";
import { ProfilePointer } from "nostr-tools/lib/nip19";
import { useMemo } from "react";
import { useNow } from "./useNow";

export function usePubkeyContactsLoader({
	profilePointer,
	pubkeyPreloadedEventSet,
	now: propsNow,
}: {
	profilePointer: ProfilePointer;
	pubkeyPreloadedEventSet?: EventSet;
	now?: string | DateTime;
}) {
	const now = useNow({ propsNow });
	const nowRounded = useMemo(() => startOf(now, '5minutes'), [ now ]);

	const initialCursor = useMemo(() => ({
		until: nowRounded.toSeconds(),
		limit: 1,
	}), [ nowRounded ]);

	const filter = useMemo(() => ({
		kinds: [ EventKind.Contacts ],
		authors: [ profilePointer.pubkey ],
	}), [ profilePointer.pubkey ]);

	const pubkeyPreloadedContactsEvents = useMemo(() => {
		return pubkeyPreloadedEventSet?.filter(filter);
	}, [ pubkeyPreloadedEventSet, filter ]);

	const { data, isInitialLoading } = trpcReact.nostr.eventsInfinite.useInfiniteQuery(filter, {
		initialCursor,
		initialData: pubkeyPreloadedContactsEvents?.size ? {
			pages: [
				{
					eventSet: pubkeyPreloadedContactsEvents,
					nextCursor: undefined,
				},
			],
			pageParams: [ initialCursor ],
		} : undefined,
	});

	const latestContactsEventFromNostr = useMemo(() => {
		const eventSet = data?.pages.at(0)?.eventSet;
		return eventSet?.getLatestEvent();
	}, [ data ]);

	const latestContactsEventFromAws = useMemo(() => {
		return undefined; // TODO
	}, []);

	const latestContactsEvent = useMemo(() => {
		return latestContactsEventFromNostr ?? latestContactsEventFromAws;
	}, [ latestContactsEventFromNostr, latestContactsEventFromAws ]);

	return {
		isLatestContactsEventLoading: isInitialLoading,
		latestContactsEvent,
	};
}
