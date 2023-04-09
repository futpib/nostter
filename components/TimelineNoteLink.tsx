import { ComponentProps } from 'react';
import { TimelineNote } from './TimelineNote';
import { nip19 } from 'nostr-tools';
import { NoteLink } from './NoteLink';

export function TimelineNoteLink(props: ComponentProps<typeof TimelineNote>) {
	const { id } = props;

	return (
		<NoteLink
			href={`/${nip19.noteEncode(id)}`}
			componentKey="TimelineNote"
			{...props}
		/>
	);
}
