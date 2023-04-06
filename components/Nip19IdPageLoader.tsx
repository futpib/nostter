'use client';

import { NoteLoader } from "./NoteLoader";
import { notFound, redirect, usePathname } from "next/navigation";
import { nip19Decode } from "@/utils/nip19Decode";

export function Nip19IdPageLoader() {
	const pathname = usePathname();

	const [ _1, nip19IdParam ] = pathname.split('/');

	const nip19DecodeResult = nip19Decode(nip19IdParam);

	if (!nip19DecodeResult) {
		notFound();
	}

	const { normalizedNip19Id, decoded } = nip19DecodeResult;

	if (normalizedNip19Id !== nip19IdParam) {
		redirect(`/${normalizedNip19Id}`);
	}

	if (decoded.type === 'profilePointer') {
		// TODO
		notFound();
	}

	const { eventPointer } = decoded;

	return (
		<NoteLoader
			componentKey="NotePage"
			eventPointer={eventPointer}
		/>
	);
}
