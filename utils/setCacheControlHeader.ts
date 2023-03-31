import { Duration } from 'luxon';
import { NextResponse } from 'next/server';

export const maxCacheTime = Duration.fromObject({ days: 31 });

export function setCacheControlHeader(response: NextResponse, {
	public: _public = false,
	immutable = false,
	maxAge,
	sMaxAge,
	staleWhileRevalidate,
}: {
	public?: boolean;
	immutable?: boolean;
	maxAge?: Duration;
	sMaxAge?: Duration;
	staleWhileRevalidate?: Duration;
}) {
	const cacheControl = [
		...(_public ? ['public'] : []),
		...(immutable ? ['immutable'] : []),
		...(maxAge ? [`max-age=${maxAge.as('seconds')}`] : []),
		...(sMaxAge ? [`s-maxage=${sMaxAge.as('seconds')}`] : []),
		...(staleWhileRevalidate ? [`stale-while-revalidate=${staleWhileRevalidate.as('seconds')}`] : []),
	].join(', ');

	response.headers.set("Cache-Control", cacheControl);
}
