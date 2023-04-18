import { ComponentProps } from 'react';
import { EmbeddedNote } from './EmbeddedNote';
import { nip19 } from 'nostr-tools';
import { NoteLink } from './NoteLink';

export function EmbeddedNoteLink(props: ComponentProps<typeof EmbeddedNote>) {
	const { id } = props;

	return (
		<NoteLink
			href={`/${nip19.noteEncode(id)}`}
			componentKey="EmbeddedNote"
			{...props}
		/>
	);
}
