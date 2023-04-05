'use client';

import { nip19DecodeNote } from "@/utils/nip19DecodeNote";
import { NoteLoader } from "./NoteLoader";
import { nip19 } from "nostr-tools";
import { notFound, usePathname } from "next/navigation";

export function NotePageLoader() {
	const pathname = usePathname();

	const [ _1, _2, nip19IdParam ] = pathname.split('/');

	if (typeof nip19IdParam !== "string") {
		notFound();
	}

	const nip19Id = nip19DecodeNote(nip19.decode(nip19IdParam));

	if (!nip19Id) {
		notFound();
	}

	return (
		<NoteLoader
			componentKey="NotePage"
			eventPointer={{
				id: nip19Id.data,
			}}
		/>
	);
}
