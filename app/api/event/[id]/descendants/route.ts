import { EVENT_KIND_SHORT_TEXT_NOTE } from "@/constants/eventKinds";
import { defaultRelays } from "@/constants/defaultRelays";
import { setCacheControlHeader } from "@/utils/setCacheControlHeader";
import { simplePool } from "@/utils/simplePool";
import { Duration } from "luxon";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params: { id } }: { params: { id?: string } }) {
	if (!id) {
		return new Response('No id provided', { status: 400 });
	}

	const events = await simplePool.list(defaultRelays, [ {
		kinds: [ EVENT_KIND_SHORT_TEXT_NOTE ],
		'#e': [ id ],
	} ]);

	events.sort((a, b) => a.id > b.id ? -1 : 1);

	const response = NextResponse.json({ events }, { status: events.length ? 200 : 404 });

	setCacheControlHeader(response, {
		public: true,
		sMaxAge: Duration.fromObject({ minutes: 1 }),
		staleWhileRevalidate: Duration.fromObject({ minutes: 1 }),
	});

	return response;
}
