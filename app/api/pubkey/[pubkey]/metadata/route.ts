import { EVENT_KIND_METADATA } from "@/constants/eventKinds";
import { relays } from "@/constants/relays";
import { setCacheControlHeader } from "@/utils/setCacheControlHeader";
import { simplePool } from "@/utils/simplePool";
import { Duration } from "luxon";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params: { pubkey } }: { params: { pubkey?: string } }) {
	if (!pubkey) {
		return new Response('No pubkey provided', { status: 400 });
	}

	const event = await simplePool.get(relays, {
		kinds: [ EVENT_KIND_METADATA ],
		authors: [ pubkey ],
	});

	if (!event) {
		const response = new NextResponse('Event not found', { status: 404 });

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
