"use client";

import { Note } from "./Note";
import { EventPointer } from "nostr-tools/lib/nip19";
import { useQueries, useQuery } from "@tanstack/react-query";
import { EmbeddedNote } from "./EmbeddedNote";
import { getPubkeyMetadataRequests } from "@/utils/getPubkeyMetadataRequests";
import { useMemo } from "react";
import { Event, parseReferences } from "nostr-tools";
import { parsePubkeyMetadataEvents } from "@/utils/parsePubkeyMetadataEvents";
import { renderNoteContent } from "@/utils/renderNoteContent";
import { getContentImageLinks } from "@/utils/getContentImageLinks";
import { getContentReferencedEvents } from "@/utils/getContentReferencedEvents";
import { EmbeddedNoteSkeleton } from "./EmbeddedNoteSkeleton";
import { getContentVideoLinks } from "@/utils/getContentVideoLinks";
import { getPublicRuntimeConfig } from "@/utils/getPublicRuntimeConfig";
import { EmbeddedNoteLink } from "./EmbeddedNoteLink";
import { ParentNote } from "./ParentNote";
import { ParentNoteLink } from "./ParentNoteLink";
import { ChildNote } from "./ChildNote";
import { ChildNoteLink } from "./ChildNoteLink";
import { NotePage } from "./NotePage";
import { getReferencedProfiles } from "@/utils/getReferencedProfiles";
import { NoteSkeleton } from "./NoteSkeleton";
import { ParentNoteSkeleton } from "./ParentNoteSkeleton";
import { ChildNoteSkeleton } from "./ChildNoteSkeleton";

const components = {
	NotePage,
	Note,
	ParentNote,
	ParentNoteLink,
	EmbeddedNote,
	EmbeddedNoteLink,
	ChildNote,
	ChildNoteLink,
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
};

export function NoteLoader({
	componentKey,
	eventPointer,
	onEventQuerySuccess,
}: {
	componentKey: keyof typeof components;
	eventPointer: EventPointer;
	onEventQuerySuccess?: (data: { event?: Event }) => void;
}) {
	const { publicUrl } = getPublicRuntimeConfig();

	const eventUrl = useMemo(() => {
		const url = new URL(`${publicUrl}/api/event/${eventPointer.id}`);

		for (const relay of eventPointer.relays ?? []) {
			url.searchParams.append('relays', relay);
		}

		return url.toString();
	}, [eventPointer.id, eventPointer.relays]);

	const eventQuery = useQuery([ eventUrl ], async (): Promise<{ event?: Event }> => {
		const response = await fetch(eventUrl);

		if (response.status === 404) {
			return {};
		}

		return response.json();
	}, {
		onSuccess: (data) => {
			onEventQuerySuccess?.(data);
		},
	});

	const pubkeyMetadataRequests = useMemo(() => {
		return eventQuery.data?.event ? getPubkeyMetadataRequests(eventQuery.data.event) : [];
	}, [ eventQuery.data ])

	const pubkeyMetadataEventQueries = useQueries({
		queries: pubkeyMetadataRequests.map(request => ({
			queryKey: [ request ],
			queryFn: async (): Promise<{ event?: Event }> => {
				const response = await fetch(request);

				if (response.status === 404) {
					return {};
				}

				return response.json();
			},
		})),
	});

	const overallLoading = eventQuery.isLoading || pubkeyMetadataEventQueries.some(query => query.isLoading);

	const Component = components[componentKey];
	const SkeletonComponent = skeletonComponents[componentKey];
	const NotFoundComponent = notFoundComponents[componentKey];

	const noteEvent = eventQuery.data?.event;
	const pubkeyMetadatas = parsePubkeyMetadataEvents(pubkeyMetadataEventQueries.flatMap(query => query.data?.event ? [ query.data.event ] : []));

	const { contentTokens } = useMemo(() => {
		const references = noteEvent ? parseReferences(noteEvent) : [];

		return renderNoteContent({
			content: noteEvent?.content || '',
			references,
			pubkeyMetadatas,
		});
	}, [noteEvent?.content, pubkeyMetadatas]);

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

	const references = noteEvent ? parseReferences(noteEvent) : undefined;
	const { repliedProfilePointers } = noteEvent ? getReferencedProfiles(noteEvent) : { repliedProfilePointers: [] };

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
			/>
		) : (
			<NotFoundComponent />
		)
	);
}
