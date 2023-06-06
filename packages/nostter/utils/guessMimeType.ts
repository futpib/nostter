import * as mimeTypes from 'mime-types';
import { tryParseUrl } from './tryParseUrl';

function lookupMimeType(filenameOrExt: string): undefined | string {
	return mimeTypes.lookup(filenameOrExt) || undefined;
}

export function guessMimeType(urlString: string): undefined | string {
	const url = tryParseUrl(urlString);

	let mimeType = url?.pathname ? lookupMimeType(url.pathname) : undefined;

	if (
		!mimeType
			&& (
				url?.protocol === 'https:'
					|| url?.protocol === 'http:'
			)
	) {
		mimeType = 'text/html';
	}

	return mimeType;
}
