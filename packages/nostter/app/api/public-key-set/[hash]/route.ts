import { s3 } from "@/s3";
import { maxCacheTime, setCacheControlHeader } from "@/utils/setCacheControlHeader";
import { NextRequest, NextResponse } from "next/server";

function setMaxCacheControlHeader(response: Pick<NextResponse, 'headers'>) {
	setCacheControlHeader(response, {
		immutable: true,
		public: true,
		maxAge: maxCacheTime,
	});

	return response;
}

export async function GET(_request: NextRequest, { params: { hash } }: { params: { hash?: string } }) {
	if (!hash) {
		return new NextResponse('No hash provided', { status: 400 });
	}

	const s3Object = await s3.getObject({
		Bucket: 'nostter-public-key-sets',
		Key: hash,
	});

	const response = new Response(s3Object.Body?.transformToWebStream(), {
		headers: {
			'Content-Type': 'application/json',
		},
	});

	return setMaxCacheControlHeader(response);
}
