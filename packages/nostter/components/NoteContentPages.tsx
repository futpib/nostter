import { PageLink } from '@/utils/getContentPageLinks';
import invariant from 'invariant';
import { NoteContentPage, PageLinkMetadata } from './NoteContentPage';

export function NoteContentPages({
	contentPageLinks,
	pageLinkMetadatas,
}: {
	contentPageLinks: PageLink[];
	pageLinkMetadatas: Map<string, PageLinkMetadata>;
}) {
	invariant(contentPageLinks.length <= 1, 'contentPageLinks.length > 1');

	const pageLink = contentPageLinks.at(0);
	const pageLinkMetadata = pageLink ? pageLinkMetadatas.get(pageLink.url) : undefined;

	return (pageLink && pageLinkMetadata) ? (
		<NoteContentPage
			pageLinkMetadata={pageLinkMetadata}
		/>
	) : null;
}
