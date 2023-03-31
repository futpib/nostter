"use client";

import { Note } from "./Note";
import { EventPointer } from "nostr-tools/lib/nip19";
import { useQueries, useQuery } from "@tanstack/react-query";
import { publicUrl } from "@/environment/publicUrl";
import { EmbeddedNote } from "./EmbeddedNote";
import { getPubkeyMetadataRequests } from "@/utils/getPubkeyMetadataRequests";
import { useEffect, useMemo, useState } from "react";
import { Event, parseReferences } from "nostr-tools";
import { parsePubkeyMetadataEvents } from "@/utils/parsePubkeyMetadataEvents";
import { renderNoteContent } from "@/utils/renderNoteContent";
import { getContentImageLinks } from "@/utils/getContentImageLinks";
import { getContentReferencedEvents } from "@/utils/getContentReferencedEvents";
import { EmbeddedNoteSkeleton } from "./EmbeddedNoteSkeleton";
import { getContentVideoLinks } from "@/utils/getContentVideoLinks";

const components = {
	Note,
	EmbeddedNote,
};

const NoteSkeleton = () => null;

const skeletonComponents = {
	Note: NoteSkeleton,
	EmbeddedNote: EmbeddedNoteSkeleton,
};

const NoteNotFound = () => null;
const EmbeddedNoteNotFound = () => null;

const notFoundComponents = {
	Note: NoteNotFound,
	EmbeddedNote: EmbeddedNoteNotFound,
};

export function NoteLoader({
	componentKey,
	eventPointer,
}: {
	componentKey: keyof typeof components;
	eventPointer: EventPointer;
}) {
	const eventUrl = `${publicUrl}/api/event/${eventPointer.id}`;
	const eventQuery = useQuery([ eventUrl ], async (): Promise<{ event?: Event }> => {
		const response = await fetch(eventUrl);

		if (response.status === 404) {
			return {};
		}

		return response.json();
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
		return renderNoteContent({
			content: noteEvent?.content || '',
			references: [],
			pubkeyMetadatas: new Map(),
		});
	}, [noteEvent?.content]);

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

	return overallLoading ? (
		<SkeletonComponent />
	) : (
		(noteEvent && references) ? (
			<Component
				pubkey={noteEvent.pubkey}
				content={noteEvent.content}
				contentImageLinks={contentImageLinks}
				contentVideoLinks={contentVideoLinks}
				contentReferencedEvents={contentReferencedEvents}
				createdAt={noteEvent.created_at}
				references={references}
				pubkeyMetadatas={pubkeyMetadatas}
			/>
		) : (
			<NotFoundComponent />
		)
	);
}