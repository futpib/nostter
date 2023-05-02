import { PageLinkMetadata } from "@/components/NoteContentPage";
import { isPageLinkMetadataComplete } from "./isPageMetadataComplete";

export function parsePageLinkMetadatas(responses: { metadata?: Partial<PageLinkMetadata> }[]): Map<string, PageLinkMetadata> {
	return new Map(responses.flatMap(response => {
		if (response.metadata && isPageLinkMetadataComplete(response.metadata)) {
			return [
				[ response.metadata.url, response.metadata ],
			];
		}

		return [];
	}));
}
