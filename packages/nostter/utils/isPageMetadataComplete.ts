import { PageLinkMetadata } from "@/components/NoteContentPage";

export function isPageLinkMetadataComplete(metadata: Partial<PageLinkMetadata>): metadata is PageLinkMetadata {
	return Boolean(
		metadata.url
			&& metadata.title
			&& metadata.description
			&& metadata.image
	);
}
