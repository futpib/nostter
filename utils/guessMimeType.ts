import * as mimeTypes from 'mime-types';
import { tryParseUrl } from './tryParseUrl';

export function guessMimeType(urlString: string): undefined | string {
	const url = tryParseUrl(urlString);

	let mimeType = mimeTypes.lookup(urlString) || mimeTypes.lookup(url?.pathname ?? '') || undefined;

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
