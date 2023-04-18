import { defaultRelays } from "@/constants/defaultRelays";
import { EVENT_KIND_SHORT_TEXT_NOTE } from "@/constants/eventKinds";
import { findLinks } from "@/utils/findLinks";
import { setCacheControlHeader } from "@/utils/setCacheControlHeader";
import { simplePool } from "@/utils/simplePool";
import { Duration } from "luxon";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params: { query } }: { params: { query?: string } }) {
	if (!query) {
		return new Response('Query is required', { status: 400 });
	}

	const url = new URL(request.url);

	const paramsRelays = url.searchParams.getAll('relays');

	const links = findLinks(query);

	const hashtags = links.filter(link => link.type === 'hashtag');

	if (hashtags.length === 0) {
		return new Response('No hashtags found, generic search is not supported yet', { status: 400 });
	}

	const [
		defaultRelaysResult,
		paramsRelaysResult,
	] = await Promise.allSettled([
		defaultRelays,
		paramsRelays,
	].map(effectiveRelays => simplePool.list(effectiveRelays, [ {
		kinds: [ EVENT_KIND_SHORT_TEXT_NOTE ],
		limit: 32,
		'#t': hashtags.map(hashtag => hashtag.value.replace('#', '')),
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
