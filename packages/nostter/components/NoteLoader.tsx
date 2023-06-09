"use client";

import { Note } from "./Note";
import { EventPointer } from "nostr-tools/lib/nip19";
import { EmbeddedNote } from "./EmbeddedNote";
import { ReactNode } from "react";
import { Event } from "nostr-tools";
import { EmbeddedNoteSkeleton } from "./EmbeddedNoteSkeleton";
import { EmbeddedNoteLink } from "./EmbeddedNoteLink";
import { ParentNote } from "./ParentNote";
import { ParentNoteLink } from "./ParentNoteLink";
import { ChildNote } from "./ChildNote";
import { ChildNoteLink } from "./ChildNoteLink";
import { NotePage } from "./NotePage";
import { NoteSkeleton } from "./NoteSkeleton";
import { ParentNoteSkeleton } from "./ParentNoteSkeleton";
import { TimelineNote } from "./TimelineNote";
import { TimelineNoteLink } from "./TimelineNoteLink";
import { ChildNoteSkeleton } from "./ChildNoteSkeleton";
import { useEventLoader } from "@/hooks/useEventLoader";
import { NoteNotFound } from "./NoteNotFound";
import { EmbeddedNoteNotFound } from "./EmbeddedNoteNotFound";

const components = {
	NotePage,
	Note,
	ParentNote,
	ParentNoteLink,
	EmbeddedNote,
	EmbeddedNoteLink,
	ChildNote,
	ChildNoteLink,
	TimelineNote,
	TimelineNoteLink,
};

const skeletonComponents = {
	NotePage: NoteSkeleton,
	Note: NoteSkeleton,
	ParentNote: ParentNoteSkeleton,
	ParentNoteLink: ParentNoteSkeleton,
	EmbeddedNote: EmbeddedNoteSkeleton,
	EmbeddedNoteLink: EmbeddedNoteSkeleton,
	ChildNote: ChildNoteSkeleton,
	ChildNoteLink: ChildNoteSkeleton,
	TimelineNote: ParentNoteSkeleton,
	TimelineNoteLink: ParentNoteSkeleton,
};

const notFoundComponents = {
	NotePage: NoteNotFound,
	Note: NoteNotFound,
	ParentNote: NoteNotFound,
	ParentNoteLink: NoteNotFound,
	EmbeddedNote: EmbeddedNoteNotFound,
	EmbeddedNoteLink: EmbeddedNoteNotFound,
	ChildNote: NoteNotFound,
	ChildNoteLink: NoteNotFound,
	TimelineNote: NoteNotFound,
	TimelineNoteLink: NoteNotFound,
};

export function NoteLoader({
	componentKey,
	eventPointer,
	event: initialDataEvent,
	onEventQuerySuccess,
	repostHeaderChildren,
}: {
	componentKey: keyof typeof components;
	eventPointer: EventPointer;
	event?: Event;
	onEventQuerySuccess?: (data: { event?: Event }) => void;
	repostHeaderChildren?: ReactNode;
}) {
	const {
		isInitialLoading,

		event,
		references,

		tagsImageLinks,
		tagsVideoLinks,

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
			pubkey={event.pubkey}
			content={event.content}
			tagsImageLinks={tagsImageLinks}
			tagsVideoLinks={tagsVideoLinks}
			contentImageLinks={contentImageLinks}
			contentVideoLinks={contentVideoLinks}
			contentPageLinks={contentPageLinks}
			contentReferencedEvents={contentReferencedEvents}
			createdAt={event.created_at}
			references={references}
			repliedProfilePointers={repliedProfilePointers}
			pubkeyMetadatas={pubkeyMetadatas}
			pageLinkMetadatas={pageLinkMetadatas}
			repostHeaderChildren={repostHeaderChildren}
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
