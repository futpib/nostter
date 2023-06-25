import { trpcReact } from "@/clients/trpc";
import { startOf } from "@/luxon";
import { EventKind } from "@/nostr/EventKind";
import { DateTime } from "luxon";
import { ProfilePointer } from "nostr-tools/lib/nip19";
import { useMemo } from "react";
import { useNow } from "./useNow";

export function usePubkeyContactsLoader({
	profilePointer,
	now: propsNow,
}: {
	profilePointer: ProfilePointer;
	now?: string | DateTime;
}) {
	const now = useNow({ propsNow });
	const nowRounded = useMemo(() => startOf(now, '5minutes'), [ now ]);

	const initialCursor = useMemo(() => ({
		until: nowRounded.toSeconds(),
		limit: 1,
	}), [ nowRounded ]);

	const { data, isInitialLoading } = trpcReact.nostr.eventsInfinite.useInfiniteQuery({
		kinds: [ EventKind.Contacts ],
		authors: [ profilePointer.pubkey ],
	}, {
		initialCursor,
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
