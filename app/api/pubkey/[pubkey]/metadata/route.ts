import { EVENT_KIND_METADATA } from "@/constants/eventKinds";
import { relays as defaultRelays } from "@/constants/relays";
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

	const [
		defaultRelaysResult,
		paramsRelaysResult,
	] = await Promise.allSettled([
		defaultRelays,
		paramsRelays,
	].map(effectiveRelays => simplePool.get(effectiveRelays, {
		kinds: [ EVENT_KIND_METADATA ],
		authors: [ pubkey ],
	})));

	const event = (() => {
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

	if (!event) {
		const response = NextResponse.json({}, { status: 404 });

		setCacheControlHeader(response, {
			public: true,
			sMaxAge: Duration.fromObject({ minutes: 1 }),
			staleWhileRevalidate: Duration.fromObject({ minutes: 1 }),
		});

		return response;
	}

	const response = NextResponse.json({ event });

	setCacheControlHeader(response, {
		public: true,
		sMaxAge: Duration.fromObject({ minutes: 5 }),
		staleWhileRevalidate: Duration.fromObject({ minutes: 5 }),
	});

	return response;
}
