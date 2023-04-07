
export function tryParseUrl(urlString: string): undefined | URL {
	try {
		return new URL(urlString);
	} catch (error) {
		if (error instanceof TypeError) {
			return undefined;
		}

		throw error;
	}
}
