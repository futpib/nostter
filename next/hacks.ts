import pMemoize from 'p-memoize';

const patchedFetchToOriginalFetch = new WeakMap();

const nossrPathPrefixes = [
	'/note/',
];

class ResponseMap extends Map<string, undefined | Response> {
	set(key: string, value: undefined | Response): this {
		return super.set(key, value?.clone());
	}

	get(key: string): undefined | Response {
		return super.get(key)?.clone();
	}
}

const memoizedNossrFetch = pMemoize(fetch, {
	cache: new ResponseMap(),
});

export function patchFetchForClientOnlyNavigation() {
	if (typeof window === 'undefined') {
		return;
	}

	if (patchedFetchToOriginalFetch.has(window.fetch)) {
		return;
	}

	const originalFetch = window.fetch;
	const patchedFetch: typeof originalFetch = async (request, options) => {
		if (typeof request === 'string' && options?.headers) {
			const url = new URL(request);

			if (url.pathname.endsWith('/nossr')) {
				return originalFetch(request, options);
			}

			for (const nossrPathPrefix of nossrPathPrefixes) {
				if (url.pathname.startsWith(nossrPathPrefix)) {
					url.pathname += '/nossr';

					const response = await memoizedNossrFetch(url.toString(), options);

					return response;
				}
			}
		}

		return originalFetch(request, options);
	};

	window.fetch = patchedFetch;
	patchedFetchToOriginalFetch.set(patchedFetch, originalFetch);

	return () => {
		const originalFetch = patchedFetchToOriginalFetch.get(window.fetch);
		if (originalFetch) {
			window.fetch = originalFetch;
		}
	};
}
