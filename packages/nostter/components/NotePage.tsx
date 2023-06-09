import { ImageLink } from "@/utils/getContentImageLinks";
import { PubkeyMetadata, renderNoteContent } from "@/utils/renderNoteContent";
import { NextSeo } from "next-seo";
import { EventPointer, ProfilePointer } from "nostr-tools/lib/nip19";
import { MouseEvent, useMemo } from "react";
import { Note } from "./Note";
import { NoteChildNotes } from "./NoteChildNotes";
import { NoteParentNotes } from "./NoteParentNotes";
import { getThread } from "@/utils/getThread";
import { getProfileDisplayNameText } from "@/utils/getProfileDisplayNameText";
import { Reference } from "@/utils/getNoteContentTokens";
import { getProfileMentionNameText } from "@/utils/getProfileMentionNameText";
import { PageLink } from "@/utils/getContentPageLinks";
import { PageLinkMetadata } from "./NoteContentPage";
import { trpcReact } from "@/clients/trpc";

export function NotePage({
	id,
	pubkey,
	content,
	references,
	repliedProfilePointers,
	createdAt,
	pubkeyMetadatas,
	tagsImageLinks,
	tagsVideoLinks,
	contentImageLinks,
	contentVideoLinks,
	contentPageLinks,
	pageLinkMetadatas,
	contentReferencedEvents,
	onClick,
	onAuxClick,
}: {
	id: string;
	pubkey: string;
	content: string;
	references: Reference[];
	repliedProfilePointers: ProfilePointer[];
	createdAt: number;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
	tagsImageLinks: ImageLink[];
	tagsVideoLinks: ImageLink[];
	contentImageLinks: ImageLink[];
	contentVideoLinks: ImageLink[];
	contentPageLinks: PageLink[];
	pageLinkMetadatas: Map<string, PageLinkMetadata>;
	contentReferencedEvents: EventPointer[];
	onClick?: (event: MouseEvent<HTMLElement>) => void;
	onAuxClick?: (event: MouseEvent<HTMLElement>) => void;
}) {
	const noteEventQuery = trpcReact.nostr.event.useQuery({ id });

	const noteEvent = noteEventQuery.data?.toEvent();

	const pubkeyText = noteEvent ? getProfileDisplayNameText({
		pubkey: noteEvent.pubkey,
		pubkeyMetadatas,
	}) : undefined;

	const contentText = useMemo(() => {
		if (!noteEvent) {
			return '';
		}

		const { contentChildren } = renderNoteContent({
			content: noteEvent.content,
			references,
		}, {
			renderEventReference: () => '',
			renderProfileReference: ({ profilePointer }) => getProfileMentionNameText({
				pubkey: profilePointer.pubkey,
				pubkeyMetadatas,
			}),
			renderLink: ({ token: { link } }) => link.value,
		});

		const contentText = contentChildren.join('');

		return contentText;
	}, [ noteEvent?.content, references, pubkeyMetadatas ]);

	const thread = useMemo(() => {
		if (!noteEvent) {
			return undefined;
		}

		return getThread(noteEvent, {
			contentReferencedEvents,
		});
	}, [ noteEvent, contentReferencedEvents ]);

	return noteEvent ? (
		<>
			<NextSeo
				useAppDir
				title={`${pubkeyText} on Nostr: ${contentText}`}
				description={contentText}
			/>

			<NoteParentNotes
				id={noteEvent.id}
				root={thread?.root}
				reply={thread?.reply}
				contentReferencedEvents={contentReferencedEvents}
			/>

			<div style={{ minHeight: '100vh' }}>
				<Note
					id={noteEvent.id}
					pubkey={noteEvent.pubkey}
					content={noteEvent.content}
					tagsImageLinks={tagsImageLinks}
					tagsVideoLinks={tagsVideoLinks}
					contentImageLinks={contentImageLinks}
					contentVideoLinks={contentVideoLinks}
					contentPageLinks={contentPageLinks}
					contentReferencedEvents={contentReferencedEvents}
					createdAt={noteEvent.created_at}
					references={references}
					repliedProfilePointers={repliedProfilePointers}
					pubkeyMetadatas={pubkeyMetadatas}
					pageLinkMetadatas={pageLinkMetadatas}
				/>

				<NoteChildNotes
					id={noteEvent.id}
				/>
			</div>
		</>
	) : null;
}
