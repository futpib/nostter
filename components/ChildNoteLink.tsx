import { ComponentProps } from 'react';
import { ChildNote } from './ChildNote';
import Link from 'next/link';
import { nip19 } from 'nostr-tools';

export function ChildNoteLink(props: ComponentProps<typeof ChildNote>) {
	const { id } = props;

	return (
		<Link href={`/note/${nip19.noteEncode(id)}`}>
			<ChildNote {...props} />
		</Link>
	);
}
