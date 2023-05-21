import { trpcReact } from "@/clients/trpc";
import { EventSet } from "@/nostr/EventSet";
import { getContentImageLinks } from "@/utils/getContentImageLinks";
import { getContentPageLinks } from "@/utils/getContentPageLinks";
import { getContentReferencedEvents } from "@/utils/getContentReferencedEvents";
import { getContentVideoLinks } from "@/utils/getContentVideoLinks";
import { getNoteContentTokens } from "@/utils/getNoteContentTokens";
import { getReferencedProfiles } from "@/utils/getReferencedProfiles";
import { parsePageLinkMetadatas } from "@/utils/parsePageLinkMetadatas";
import { toEventPointer } from "@/utils/toEventPointer";
import invariant from "invariant";
import { DateTime } from "luxon";
import { nip18 } from "nostr-tools";
import { EventPointer, ProfilePointer } from "nostr-tools/lib/nip19";
import { useMemo } from "react";
import { usePubkeyMetadatasLoader } from "./usePubkeyMetadatasLoader";
import { Event, parseReferences } from "nostr-tools";

export function useEventLoader({
	eventPointer,
	initialDataEvent,
	onEventQuerySuccess,
	now,
}: {
	eventPointer: EventPointer;
	initialDataEvent?: Event;
	onEventQuerySuccess?: (data: EventSet) => void;
	now?: string | DateTime;
}) {
	const eventQuery = trpcReact.nostr.event.useQuery(toEventPointer(eventPointer), {
		enabled: initialDataEvent?.id !== eventPointer.id,

		onSuccess: (data) => {
			onEventQuerySuccess?.(data);
		},

		initialData: initialDataEvent ? (() => {
			const eventSet = new EventSet();
			eventSet.add(initialDataEvent);
			return eventSet;
		})() : undefined,
	});

	const event = eventQuery.data?.toEvent();

	const eventProfilePointer: undefined | ProfilePointer = event ? {
		pubkey: event.pubkey,
	} : undefined;

	const { profilePointers = [], repliedProfilePointers = [] } = event ? getReferencedProfiles(event) : {};

	const repostedEventPointer = useMemo(() => event ? nip18.getRepostedEventPointer(event) : undefined, [event]);
	const repostedEvent = useMemo(() => event ? nip18.getRepostedEvent(event) : undefined, [event]);

	const references = useMemo(() => event ? parseReferences(event) : undefined, [event]);

	const contentTokens = useMemo(() => getNoteContentTokens(event?.content || '', references ?? []), [event?.content, references]);

	const contentImageLinks = useMemo(() => {
		return getContentImageLinks(contentTokens);
	}, [
		contentTokens,
	]);

	const contentVideoLinks = useMemo(() => {
		return getContentVideoLinks(contentTokens);
	}, [
		contentTokens,
	]);

	const contentPageLinks = useMemo(() => {
		return getContentPageLinks(contentTokens);
	}, [
		contentTokens,
	]);

	invariant(contentPageLinks.length <= 1, 'useEventLoader: contentPageLinks.length > 1');

	const contentReferencedEvents = useMemo(() => {
		return getContentReferencedEvents(contentTokens);
	}, [
		contentTokens,
	]);

	const contentPageLinkMetadataQuery = trpcReact.page.metadata.useQuery({
		url: contentPageLinks.at(0)?.url ?? '',
	}, {
		enabled: contentPageLinks.length === 1,
	});

	const pageLinkMetadatas = useMemo(() => {
		return parsePageLinkMetadatas(contentPageLinkMetadataQuery.data ? [ contentPageLinkMetadataQuery.data ] : []);
	}, [
		contentPageLinkMetadataQuery.data
	]);

	const {
		isProfileMetadatasInitialLoading,
		pubkeyMetadatas,
	} = usePubkeyMetadatasLoader({
		profilePointers: [
			...(eventProfilePointer ? [ eventProfilePointer ] : []),
			...profilePointers,
		],
		now,
	});

	const isInitialLoading = eventQuery.isInitialLoading || isProfileMetadatasInitialLoading;

	return {
		isInitialLoading,

		event,
		references,

		repostedEventPointer,
		repostedEvent,

		contentImageLinks,
		contentVideoLinks,
		contentPageLinks,
		contentReferencedEvents,

		pubkeyMetadatas,
		pageLinkMetadatas,

		repliedProfilePointers,
	};
}
