import { trpcReact } from "@/clients/trpc";
import { startOf } from "@/luxon";
import { EventKind } from "@/nostr/EventKind";
import { parsePubkeyMetadataEvents } from "@/utils/parsePubkeyMetadataEvents";
import { DateTime } from "luxon";
import { ProfilePointer } from "nostr-tools/lib/nip19";
import { useMemo } from "react";
import { useNow } from "./useNow";

export function usePubkeyMetadatasLoader({
	profilePointers,
	now: propsNow,
}: {
	profilePointers: ProfilePointer[];
	now?: string | DateTime;
}) {
	const now = useNow({ propsNow });
	const nowRounded = useMemo(() => startOf(now, 'hour'), [ now ]);

	const initialCursor = useMemo(() => ({
		until: nowRounded.toSeconds(),
		limit: 1,
	}), [ nowRounded ]);

	const pubkeyMetadataEventQueries = trpcReact.useQueries(t => profilePointers.flatMap(profilePointer => {
		if (!profilePointer) {
			return [];
		}

		return [
			t.nostr.eventsInfinite({
				kinds: [
					EventKind.Metadata,
				],

				authors: [
					profilePointer.pubkey,
				],

				cursor: initialCursor,
			}),
		];
	}));

	const isProfileMetadatasInitialLoading = pubkeyMetadataEventQueries.some(query => query.isInitialLoading);

	const pubkeyMetadatas = parsePubkeyMetadataEvents(
		pubkeyMetadataEventQueries.flatMap(query => Array.from(query.data?.eventSet ?? []))
	);

	return {
		pubkeyMetadatas,
		isProfileMetadatasInitialLoading,
	};
}
