import { ImageLink } from "./getContentImageLinks";
import { guessMimeType } from "./guessMimeType";

export function getTagsImageLinks(tags: (undefined | string)[][]): ImageLink[] {
	const urlTag = tags.find(tag => tag[0] === 'url');
	const mimeTypeTag = tags.find(tag => tag[0] === 'm');
	const blurhashTag = tags.find(tag => tag[0] === 'blurhash');

	const [ _0, url ] = urlTag ?? [];
	const [ _1, mimeTypeFromTag ] = mimeTypeTag ?? [];
	const [ _2, blurhash ] = blurhashTag ?? [];

	const mimeType = mimeTypeFromTag ?? (url ? guessMimeType(url) : undefined);

	const [ type ] = mimeType?.split('/') ?? [];

	if (!mimeType || type !== 'image') {
		return [];
	}

	if (!url) {
		return [];
	}

	return [ {
		url,
		secureUrl: url.startsWith('https') ? url : undefined,
		type: mimeType,
		blurhash,
	} ];
}
