"use client";

import { EventPointer } from "nostr-tools/lib/nip19";
import { Event } from "nostr-tools";
import { ParentNoteSkeleton } from "./ParentNoteSkeleton";
import { TimelineEvent } from "./TimelineEvent";
import { useEventLoader } from "@/hooks/useEventLoader";

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
	const {
		isInitialLoading,

		event,
		references,

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
			repliedProfilePointers={repliedProfilePointers}
			pubkeyMetadatas={pubkeyMetadatas}
			pageLinkMetadatas={pageLinkMetadatas}
		/>
	) : isInitialLoading ? (
		<SkeletonComponent
			id={eventPointer.id}
		/>
	) : (
		<NotFoundComponent />
	);
}
