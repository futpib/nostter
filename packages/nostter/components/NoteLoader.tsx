"use client";

import { Note } from "./Note";
import { EventPointer, ProfilePointer } from "nostr-tools/lib/nip19";
import { EmbeddedNote } from "./EmbeddedNote";
import { ReactNode, useMemo } from "react";
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

const NoteNotFound = () => (
	<div>
		Note not found
	</div>
);

const notFoundComponents = {
	// TODO
	NotePage: NoteNotFound,
	Note: NoteNotFound,
	ParentNote: NoteNotFound,
	ParentNoteLink: NoteNotFound,
	EmbeddedNote: NoteNotFound,
	EmbeddedNoteLink: NoteNotFound,
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

	const noteEvent = eventQuery.data?.toEvent();

	const noteEventProfilePointer: undefined | ProfilePointer = noteEvent ? {
		pubkey: noteEvent.pubkey,
	} : undefined;

	const { profilePointers = [], repliedProfilePointers = [] } = noteEvent ? getReferencedProfiles(noteEvent) : {};

	const pubkeyMetadataEventQueries = useAppQueries({
		queries: [ noteEventProfilePointer, ...profilePointers ].flatMap(profilePointer => profilePointer ? [
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

	const overallLoading = eventQuery.isInitialLoading || pubkeyMetadataEventQueries.isInitialLoading;

	const pubkeyMetadatas = parsePubkeyMetadataEvents(Array.from(pubkeyMetadataEventQueries.data ?? []));

	const references = noteEvent ? parseReferences(noteEvent) : undefined;

	const contentTokens = useMemo(() => getNoteContentTokens(noteEvent?.content || '', references ?? []), [noteEvent?.content, references]);

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
		(noteEvent && references) ? (
			<Component
				id={noteEvent.id}
				pubkey={noteEvent.pubkey}
				content={noteEvent.content}
				contentImageLinks={contentImageLinks}
				contentVideoLinks={contentVideoLinks}
				contentReferencedEvents={contentReferencedEvents}
				createdAt={noteEvent.created_at}
				references={references}
				repliedProfilePointers={repliedProfilePointers}
				pubkeyMetadatas={pubkeyMetadatas}
				repostHeaderChildren={repostHeaderChildren}
			/>
		) : (
			<NotFoundComponent />
		)
	);
}
