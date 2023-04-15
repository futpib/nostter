import { Duration } from 'luxon';
import { NextResponse } from 'next/server';

export const maxCacheTime = Duration.fromObject({ days: 31 });

type CacheControlOptions = {
	public?: boolean;
	immutable?: boolean;
	maxAge?: Duration;
	sMaxAge?: Duration;
	staleWhileRevalidate?: Duration;
};

export function getCacheControlHeader({
	public: _public = false,
	immutable = false,
	maxAge,
	sMaxAge,
	staleWhileRevalidate,
}: CacheControlOptions) {
	return [
		...(_public ? ['public'] : []),
		...(immutable ? ['immutable'] : []),
		...(maxAge ? [`max-age=${maxAge.as('seconds')}`] : []),
		...(sMaxAge ? [`s-maxage=${sMaxAge.as('seconds')}`] : []),
		...(staleWhileRevalidate ? [`stale-while-revalidate=${staleWhileRevalidate.as('seconds')}`] : []),
	].join(', ');
};

export function setCacheControlHeader(response: Pick<NextResponse, 'headers'>, options: CacheControlOptions) {
	response.headers.set("Cache-Control", getCacheControlHeader(options));
}
