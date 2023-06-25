'use client';

import { notFound, redirect, useParams } from "next/navigation";
import { nip19Decode } from "@/utils/nip19Decode";
import { ProfileLoader } from "./ProfileLoader";

export function Nip19IdProfileFollowingPageLoader() {
	const {
		nip19Id: nip19IdParam,
		rest: restParams,
	} = useParams() ?? {};

	const nip19DecodeResult = nip19Decode(nip19IdParam);

	if (!nip19DecodeResult) {
		notFound();
	}

	const { normalizedNip19Id, decoded } = nip19DecodeResult;

	if (normalizedNip19Id !== nip19IdParam) {
		redirect(`/${normalizedNip19Id}/following`);
	}

	if (decoded.type !== 'profilePointer') {
		redirect(`/${normalizedNip19Id}`);
	}

	return (
		<ProfileLoader
			componentKey="ProfileFollowingPage"
			profilePointer={decoded.profilePointer}
		/>
	);
}
