'use client';

import { NoteLoader } from "./NoteLoader";
import { notFound, redirect, usePathname } from "next/navigation";
import { nip19Decode } from "@/utils/nip19Decode";
import { EventPointer, ProfilePointer } from "nostr-tools/lib/nip19";
import { ProfileLoader } from "./ProfileLoader";

function Nip19IdNotePageLoader({ eventPointer }: {
	eventPointer: EventPointer;
}) {
	return (
		<NoteLoader
			componentKey="NotePage"
			eventPointer={eventPointer}
		/>
	);
}

function Nip19IdProfilePageLoader({ profilePointer }: {
	profilePointer: ProfilePointer;
}) {
	return (
		<ProfileLoader
			componentKey="ProfilePage"
			profilePointer={profilePointer}
		/>
	);
}

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
		return Nip19IdProfilePageLoader({ profilePointer: decoded.profilePointer });
	}

	return Nip19IdNotePageLoader({ eventPointer: decoded.eventPointer });
}
