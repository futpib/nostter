"use client";

import { Note } from "./Note";
import { EventPointer, ProfilePointer } from "nostr-tools/lib/nip19";
import { EmbeddedNote } from "./EmbeddedNote";
import { useMemo } from "react";
import { Event, parseReferences } from "nostr-tools";
import { parsePubkeyMetadataEvents } from "@/utils/parsePubkeyMetadataEvents";
import { getContentImageLinks } from "@/utils/getContentImageLinks";
import { getContentReferencedEvents } from "@/utils/getContentReferencedEvents";
import { EmbeddedNoteSkeleton } from "./EmbeddedNoteSkeleton";
import { getContentVideoLinks } from "@/utils/getContentVideoLinks";
import { EmbeddedNoteLink } from "./EmbeddedNoteLink";
import { ParentNote } from "./ParentNote";
import { ParentNoteLink } from "./ParentNoteLink";
import { ChildNote } from "./ChildNote";
import { ChildNoteLink } from "./ChildNoteLink";
import { NotePage } from "./NotePage";
import { getReferencedProfiles } from "@/utils/getReferencedProfiles";
import { NoteSkeleton } from "./NoteSkeleton";
import { ParentNoteSkeleton } from "./ParentNoteSkeleton";
import { TimelineNote } from "./TimelineNote";
import { TimelineNoteLink } from "./TimelineNoteLink";
import { ChildNoteSkeleton } from "./ChildNoteSkeleton";
import { useEventQuery } from "@/hooks/useEventQuery";
import { useAppQueries } from "@/hooks/useAppQuery";
import { getNoteContentTokens } from "@/utils/getNoteContentTokens";
import { EventSet } from "@/nostr/EventSet";
import { TimelineEvent } from "./TimelineEvent";

const components = {
	TimelineEvent,
};

const skeletonComponents = {
	TimelineEvent: ParentNoteSkeleton,
};

const NoteNotFound = () => (
	<div>
		Note not found
	</div>
);

const notFoundComponents = {
	// TODO
	TimelineEvent: NoteNotFound,
	TimelineEventLink: NoteNotFound,
};

export function EventLoader({
	componentKey,
	eventPointer,
	event: initialDataEvent,
	onEventQuerySuccess,
}: {
	componentKey: keyof typeof components;
	eventPointer: EventPointer;
	event?: Event;
	onEventQuerySuccess?: (data: { event?: Event }) => void;
}) {
	const eventQuery = useEventQuery({
		eventPointer,
	}, {
		onSuccess: (data) => {
			onEventQuerySuccess?.(data);
		},
		initialData: initialDataEvent ? (() => {
			const eventSet = new EventSet();
			eventSet.add(initialDataEvent);
			return eventSet;
		})() : undefined,
	});

	const Component = components[componentKey];
	const SkeletonComponent = skeletonComponents[componentKey];
	const NotFoundComponent = notFoundComponents[componentKey];

	const event = eventQuery.data?.toEvent();

	const eventProfilePointer: undefined | ProfilePointer = event ? {
		pubkey: event.pubkey,
	} : undefined;

	const { profilePointers = [], repliedProfilePointers = [] } = event ? getReferencedProfiles(event) : {};

	const pubkeyMetadataEventQueries = useAppQueries({
		queries: [ eventProfilePointer, ...profilePointers ].flatMap(profilePointer => profilePointer ? [
			{
				queryKey: [
					'finite',
					'auto',
					'nostr',
					profilePointer,
					'pubkey',
					profilePointer.pubkey,
					'metadata',
				],
			},
		] : []),
	});

	const overallLoading = (eventQuery.isInitialLoading && !initialDataEvent) || pubkeyMetadataEventQueries.isInitialLoading;

	const pubkeyMetadatas = parsePubkeyMetadataEvents(Array.from(pubkeyMetadataEventQueries.data ?? []));

	const references = event ? parseReferences(event) : undefined;

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

	const contentReferencedEvents = useMemo(() => {
		return getContentReferencedEvents(contentTokens);
	}, [
		contentTokens,
	]);

	return overallLoading ? (
		<SkeletonComponent
			id={eventPointer.id}
		/>
	) : (
		(event && references) ? (
			<Component
				id={event.id}
				kind={event.kind}
				pubkey={event.pubkey}
				content={event.content}
				contentImageLinks={contentImageLinks}
				contentVideoLinks={contentVideoLinks}
				contentReferencedEvents={contentReferencedEvents}
				createdAt={event.created_at}
				references={references}
				repliedProfilePointers={repliedProfilePointers}
				pubkeyMetadatas={pubkeyMetadatas}
			/>
		) : (
			<NotFoundComponent />
		)
	);
}
