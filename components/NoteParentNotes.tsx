"use client";

import { EventPointer } from 'nostr-tools/lib/nip19';
import { NoteLoader } from './NoteLoader';
import { useCallback, useMemo, useState } from 'react';
import { Event } from 'nostr-tools';
import { ScrollKeeper } from './ScrollKepeer';
import { getThread } from '@/utils/getThread';

export function NoteParentNotes({
	id,
	root,
	reply,
	contentReferencedEvents,
}: {
	id: string;
	root: undefined | EventPointer;
	reply: undefined | EventPointer;
	contentReferencedEvents: EventPointer[],
}) {
	const treeLeafEdge = useMemo(() => ({ [id]: (reply ?? root)?.id }), [ id, reply, root ]);
	const [treeLoadedEventEdges, setTreeLoadedEventEdges] = useState<Record<string, undefined | string>>({});
	const [eventCustomRelays, setEventCustomRelays] = useState<Record<string, undefined | string[]>>({});
	const parents = useMemo(() => {
		const edges = {
			...treeLeafEdge,
			...treeLoadedEventEdges,
		};

		const parents: EventPointer[] = [];

		let currentId = id;
		while (currentId && currentId !== root?.id) {
			const parentId = edges[currentId];

			if (!parentId) {
				break;
			}

			const customRelays = eventCustomRelays[parentId];

			parents.unshift({
				id: parentId,
				relays: customRelays,
			});

			currentId = parentId;
		}

		return parents;
	}, [ id, root, treeLeafEdge, treeLoadedEventEdges, eventCustomRelays ]);

	const handleEventQuerySuccess = useCallback(({ event }: { event?: Event }) => {
		if (!event) {
			return;
		}

		debugger;

		const { reply, root } = getThread(event, {
			contentReferencedEvents,
		});

		const parent = reply ?? root;

		setTreeLoadedEventEdges((tree) => ({
			...tree,
			[event.id]: parent?.id,
		}));

		setEventCustomRelays((relays) => ({
			...relays,
			[event.id]: parent?.relays,
		}));
	}, []);

	return (
		<ScrollKeeper>
			{parents.flatMap((eventPointer) => eventPointer ? (
				<NoteLoader
					key={eventPointer.id}
					componentKey="ParentNoteLink"
					eventPointer={eventPointer}
					onEventQuerySuccess={handleEventQuerySuccess}
				/>
			) : [])}
		</ScrollKeeper>
	);
}
