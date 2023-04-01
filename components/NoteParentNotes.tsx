"use client";

import { EventPointer } from 'nostr-tools/lib/nip19';
import { NoteLoader } from './NoteLoader';
import { useCallback, useMemo, useState } from 'react';
import { Event, nip10 } from 'nostr-tools';
import { ScrollKeeper } from './ScrollKepeer';

export function NoteParentNotes({
	id,
	root,
	reply,
	mentions,
}: {
	id: string;
	root: undefined | EventPointer;
	reply: undefined | EventPointer;
	mentions: EventPointer[];
}) {
	const treeLeafEdge = useMemo(() => ({ [id]: (reply ?? root)?.id }), [ id, reply, root ]);
	const [treeLoadedEventEdges, setTreeLoadedEventEdges] = useState<Record<string, undefined | string>>({});
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

			parents.unshift({ id: parentId });
			currentId = parentId;
		}

		return parents;
	}, [ id, root, treeLeafEdge, treeLoadedEventEdges ]);

	const handleEventQuerySuccess = useCallback(({ event }: { event?: Event }) => {
		if (!event) {
			return;
		}

		const { reply } = nip10.parse(event);

		setTreeLoadedEventEdges((tree) => ({
			...tree,
			[event.id]: reply?.id,
		}));
	}, []);

	return (
		<ScrollKeeper>
			{parents.flatMap((eventPointer) => eventPointer ? (
				<NoteLoader
					key={eventPointer.id}
					componentKey="ParentNote"
					eventPointer={eventPointer}
					onEventQuerySuccess={handleEventQuerySuccess}
				/>
			) : [])}
		</ScrollKeeper>
	);
}
