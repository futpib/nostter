import { ComponentProps } from 'react';
import { ParentNote } from './ParentNote';
import { nip19 } from 'nostr-tools';
import { NoteLink } from './NoteLink';

export function ParentNoteLink(props: ComponentProps<typeof ParentNote>) {
	const { id } = props;

	return (
		<NoteLink
			href={`/note/${nip19.noteEncode(id)}`}
			componentKey="ParentNote"
			{...props}
		/>
	);
}
