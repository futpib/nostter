"use client";

import { EventPointer } from "nostr-tools/lib/nip19";
import { Event } from "nostr-tools";
import { ParentNoteSkeleton } from "./ParentNoteSkeleton";
import { TimelineEvent } from "./TimelineEvent";
import { useEventLoader } from "@/hooks/useEventLoader";
import { NoteNotFound } from "./NoteNotFound";

const components = {
	TimelineEvent,
};

const skeletonComponents = {
	TimelineEvent: ParentNoteSkeleton,
};

const notFoundComponents = {
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
	const {
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
	} = useEventLoader({
		eventPointer,
		initialDataEvent,
		onEventQuerySuccess,
	});

	const Component = components[componentKey];
	const SkeletonComponent = skeletonComponents[componentKey];
	const NotFoundComponent = notFoundComponents[componentKey];

	return (event && references) ? (
		<Component
			id={event.id}
			kind={event.kind}
			pubkey={event.pubkey}
			content={event.content}
			contentImageLinks={contentImageLinks}
			contentVideoLinks={contentVideoLinks}
			contentPageLinks={contentPageLinks}
			contentReferencedEvents={contentReferencedEvents}
			createdAt={event.created_at}
			references={references}
			repostedEventPointer={repostedEventPointer}
			repostedEvent={repostedEvent}
			repliedProfilePointers={repliedProfilePointers}
			pubkeyMetadatas={pubkeyMetadatas}
			pageLinkMetadatas={pageLinkMetadatas}
		/>
	) : isInitialLoading ? (
		<SkeletonComponent
			id={eventPointer.id}
		/>
	) : (
		<NotFoundComponent
			id={eventPointer.id}
		/>
	);
}
