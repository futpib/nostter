import { maxCacheTime, setCacheControlHeader } from "@/utils/setCacheControlHeader";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { escape } from 'lodash';

function setMaxCacheControlHeader(response: NextResponse) {
	setCacheControlHeader(response, {
		immutable: true,
		public: true,
		maxAge: maxCacheTime,
	});

	return response;
}

export async function GET(_request: NextRequest, { params: { q: qBase64 } }: { params: { q?: string } }) {
	if (!qBase64) {
		return new NextResponse('No q provided', { status: 400 });
	}

	const query = atob(qBase64);

	const imageBuffer = await sharp({
		create: {
			width: 1200,
			height: 600,
			channels: 4,
			background: { r: 0, g: 0, b: 0, alpha: 1 },
		},
	})
		.composite([
			{
				input: {
					text: {
						text: [
							'<span foreground="white">',
							escape(query),
							'</span>',
						].join(''),
						width: 1200 - 32,
						height: 600 - 32,
						rgba: true,
					},
				},
				top: 16,
				left: 16,
			},
		])
		.png()
		.toBuffer();

	const response = new NextResponse(imageBuffer, {
		headers: {
			'Content-Type': 'image/png',
		},
	});

	return setMaxCacheControlHeader(response);
}
