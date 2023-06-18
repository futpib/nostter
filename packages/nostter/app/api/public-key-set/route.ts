import { hashPublicKeys } from "@/nostr/PublicKeySet";
import { s3 } from "@/s3";
import invariant from "invariant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const body = await request.json();

	invariant(typeof body === 'object', 'Expected body to be an object');
	invariant(typeof body.hash === 'string', 'Expected body.hash to be a string');
	invariant(Array.isArray(body.publicKeys), 'Expected body.publicKeys to be an array');

	const hash = hashPublicKeys(body.publicKeys);

	invariant(hash === body.hash, 'Expected body.hash to match hash of body.publicKeys');

	await s3.putObject({
		Bucket: 'nostter-public-key-sets',
		Key: hash,
		Body: JSON.stringify(body.publicKeys),
	});

	return NextResponse.json({
		hash,
	});
}
