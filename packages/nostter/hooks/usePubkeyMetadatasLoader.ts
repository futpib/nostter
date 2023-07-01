import { trpcReact } from "@/clients/trpc";
import { startOf } from "@/luxon";
import { EventKind } from "@/nostr/EventKind";
import { EventSet } from "@/nostr/EventSet";
import { parsePubkeyMetadataEvents } from "@/utils/parsePubkeyMetadataEvents";
import { PubkeyMetadata } from "@/utils/renderNoteContent";
import { DateTime } from "luxon";
import { ProfilePointer } from "nostr-tools/lib/nip19";
import { useMemo } from "react";
import { useNow } from "./useNow";

export function usePubkeyMetadatasLoader({
	profilePointers,
	pubkeyPreloadedEventSet,
	pubkeyMetadatas: initialPubkeyMetadatas,
	now: propsNow,
}: {
	profilePointers: ProfilePointer[];
	pubkeyPreloadedEventSet?: EventSet;
	pubkeyMetadatas?: Map<string, PubkeyMetadata>;
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

		const filter = {
			kinds: [
				EventKind.Metadata,
			],

			authors: [
				profilePointer.pubkey,
			],
		};

		const preloadedEventSet = pubkeyPreloadedEventSet?.filter(filter);

		return [
			t.nostr.eventsInfinite({
				...filter,
				cursor: initialCursor,
			}, {
				initialData: preloadedEventSet?.size ? {
					eventSet: preloadedEventSet,
					nextCursor: undefined,
				} : undefined,
			}),
		];
	}));

	const isProfileMetadatasInitialLoading = pubkeyMetadataEventQueries.some(query => query.isInitialLoading);

	const pubkeyMetadatas = useMemo(() => {
		const pubkeyMetadatas = parsePubkeyMetadataEvents(
			pubkeyMetadataEventQueries.flatMap(query => Array.from(query.data?.eventSet ?? []))
		);

		for (const [ pubkey, pubkeyMetadata ] of initialPubkeyMetadatas?.entries() ?? []) {
			if (!pubkeyMetadatas.has(pubkey)) {
				pubkeyMetadatas.set(pubkey, pubkeyMetadata);
			}
		}

		return pubkeyMetadatas;
	}, [ initialPubkeyMetadatas, pubkeyMetadataEventQueries ]);

	return {
		pubkeyMetadatas,
		isProfileMetadatasInitialLoading,
	};
}
