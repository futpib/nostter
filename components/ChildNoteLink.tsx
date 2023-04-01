import { ComponentProps } from 'react';
import { ChildNote } from './ChildNote';
import { nip19 } from 'nostr-tools';
import { NoteLink } from './NoteLink';

export function ChildNoteLink(props: ComponentProps<typeof ChildNote>) {
	const { id } = props;

	return (
		<NoteLink
			href={`/note/${nip19.noteEncode(id)}`}
			componentKey="ChildNote"
			{...props}
		/>
	);
}
