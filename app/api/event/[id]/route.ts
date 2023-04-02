import { relays as defaultRelays } from "@/constants/relays";
import { maxCacheTime, setCacheControlHeader } from "@/utils/setCacheControlHeader";
import { simplePool } from "@/utils/simplePool";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params: { id } }: { params: { id?: string } }) {
	if (!id) {
		return new Response('No id provided', { status: 400 });
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
		ids: [ id ],
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

	if (!event || event.id !== id) {
		return NextResponse.json({}, { status: 404 });
	}

	const response = NextResponse.json({ event });

	setCacheControlHeader(response, {
		public: true,
		immutable: true,
		maxAge: maxCacheTime,
	});

	return response;
}
