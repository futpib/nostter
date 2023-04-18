import { defaultRelays } from "@/constants/defaultRelays";
import { EVENT_KIND_SHORT_TEXT_NOTE } from "@/constants/eventKinds";
import { setCacheControlHeader } from "@/utils/setCacheControlHeader";
import { simplePool } from "@/utils/simplePool";
import { Duration } from "luxon";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params: { pubkey } }: { params: { pubkey?: string } }) {
	if (!pubkey) {
		return new Response('No pubkey provided', { status: 400 });
	}

	const url = new URL(request.url);

	const paramsRelays = url.searchParams.getAll('relays');
	const [ untilString, ...extraUntilStrings ] = url.searchParams.getAll('until');

	if (extraUntilStrings.length > 0) {
		return new Response('Only one until parameter is allowed', { status: 400 });
	}

	const until = untilString ? Number.parseInt(untilString, 10) : undefined;

	if (until !== undefined && !until) {
		return new Response('Invalid until parameter', { status: 400 });
	}

	const [
		defaultRelaysResult,
		paramsRelaysResult,
	] = await Promise.allSettled([
		defaultRelays,
		paramsRelays,
	].map(effectiveRelays => simplePool.list(effectiveRelays, [ {
		kinds: [ EVENT_KIND_SHORT_TEXT_NOTE ],
		authors: [ pubkey ],
		limit: 32,
		until,
	} ])));

	const events = (() => {
		if (defaultRelaysResult.status === 'fulfilled' && defaultRelaysResult.value) {
			return defaultRelaysResult.value;
		}

		if (paramsRelaysResult.status === 'fulfilled' && paramsRelaysResult.value) {
			return paramsRelaysResult.value;
		}

		if (defaultRelaysResult.status === 'rejected') {
			throw defaultRelaysResult.reason;
		}

		if (paramsRelaysResult.status === 'rejected') {
			throw paramsRelaysResult.reason;
		}

		return undefined;
	})();

	if (!events?.length) {
		const response = NextResponse.json({ events: [] }, { status: 404 });

		setCacheControlHeader(response, {
			public: true,
			sMaxAge: Duration.fromObject({ minutes: 1 }),
			staleWhileRevalidate: Duration.fromObject({ minutes: 1 }),
		});

		return response;
	}

	const response = NextResponse.json({ events });

	setCacheControlHeader(response, {
		public: true,
		sMaxAge: Duration.fromObject({ minutes: 5 }),
		staleWhileRevalidate: Duration.fromObject({ minutes: 5 }),
	});

	return response;
}
