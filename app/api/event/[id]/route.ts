import { relays } from "@/constants/relays";
import { simplePool } from "@/utils/simplePool";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params: { id } }: { params: { id?: string } }) {
	if (!id) {
		return new Response('No id provided', { status: 400 });
	}

	const event = await simplePool.get(relays, {
		ids: [ id ],
	});

	if (!event) {
		return new Response('Event not found', { status: 404 });
	}

	const response = NextResponse.json({ event });

	response.headers.set('Cache-Control', 's-maxage=216000, stale-while-revalidate');

	return response;
}
