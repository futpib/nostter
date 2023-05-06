import { MouseEvent } from 'react';
import { EventKind } from "@/nostr/EventKind";
import { Reference } from "@/utils/getNoteContentTokens";
import { EventPointer, ProfilePointer } from "nostr-tools/lib/nip19";
import { TimelineRepost } from './TimelineRepost';
import { PubkeyMetadata } from '@/utils/renderNoteContent';
import { ImageLink } from '@/utils/getContentImageLinks';
import { TimelineNoteLink } from './TimelineNoteLink';
import { PageLink } from '@/utils/getContentPageLinks';
import { PageLinkMetadata } from './NoteContentPage';

export function TimelineEvent({
	id,
	kind,
	pubkey,
	content,
	references,
	repliedProfilePointers,
	createdAt,
	pubkeyMetadatas,
	contentImageLinks,
	contentVideoLinks,
	contentPageLinks,
	pageLinkMetadatas,
	contentReferencedEvents,
	onClick,
	onAuxClick,
}: {
	id: string;
	kind: number;
	pubkey: string;
	content: string;
	references: Reference[];
	repliedProfilePointers: ProfilePointer[];
	createdAt: number;
	pubkeyMetadatas: Map<string, PubkeyMetadata>;
	contentImageLinks: ImageLink[];
	contentVideoLinks: ImageLink[];
	contentPageLinks: PageLink[];
	pageLinkMetadatas: Map<string, PageLinkMetadata>;
	contentReferencedEvents: EventPointer[];
	onClick?: (event: MouseEvent<HTMLElement>) => void;
	onAuxClick?: (event: MouseEvent<HTMLElement>) => void;
}) {

	return kind === EventKind.Repost ? (
		<TimelineRepost
			pubkey={pubkey}
			content={content}
			pubkeyMetadatas={pubkeyMetadatas}
		/>
	) : (
		<TimelineNoteLink
			id={id}
			pubkey={pubkey}
			content={content}
			references={references}
			repliedProfilePointers={repliedProfilePointers}
			createdAt={createdAt}
			pubkeyMetadatas={pubkeyMetadatas}
			contentImageLinks={contentImageLinks}
			contentVideoLinks={contentVideoLinks}
			contentPageLinks={contentPageLinks}
			pageLinkMetadatas={pageLinkMetadatas}
			contentReferencedEvents={contentReferencedEvents}
			onClick={onClick}
			onAuxClick={onAuxClick}
		/>
	);
}