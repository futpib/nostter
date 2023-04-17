import { maxCacheTime, setCacheControlHeader } from "@/utils/setCacheControlHeader";
import { NextRequest, NextResponse } from "next/server";
import sharp from 'sharp';

function setMaxCacheControlHeader(response: NextResponse) {
	setCacheControlHeader(response, {
		immutable: true,
		public: true,
		maxAge: maxCacheTime,
	});

	return response;
}

export async function GET(_request: NextRequest, { params: { url } }: { params: { url?: string } }) {
	if (!url) {
		return new NextResponse('No url provided', { status: 400 });
	}

	const headResponse = await fetch(url, {
		method: 'HEAD',
	});

	if (!headResponse.ok) {
		return setMaxCacheControlHeader(new NextResponse('Invalid url', { status: 404 }));
	}

	const contentLength = headResponse.headers.get('content-length');

	if (!contentLength) {
		return setMaxCacheControlHeader(new NextResponse('Invalid url (unknown image size)', { status: 404 }));
	}

	const contentLengthNumber = Number(contentLength);

	if (!contentLengthNumber || contentLengthNumber > 10000000) {
		return setMaxCacheControlHeader(new NextResponse('Invalid url (invalid image size)', { status: 404 }));
	}

	try {
		const imageResponse = await fetch(url);

		const resizedBuffer = await (
			sharp(await imageResponse.arrayBuffer())
				.resize(128, 128)
				.jpeg({ mozjpeg: true })
				.toBuffer()
		);

		const response = new NextResponse(resizedBuffer, {
			headers: {
				'Content-Type': 'image/jpeg',
			},
		});

		return setMaxCacheControlHeader(response);
	} catch (error) {
		console.error(error);

		const response = new NextResponse('Invalid url (broken image)', { status: 404 });

		return setMaxCacheControlHeader(response);
	}
}
