import { ComponentProps } from 'react';
import { ParentNote } from './ParentNote';
import Link from 'next/link';
import { nip19 } from 'nostr-tools';

export function ParentNoteLink(props: ComponentProps<typeof ParentNote>) {
	const { id } = props;

	return (
		<Link href={`/note/${nip19.noteEncode(id)}`}>
			<ParentNote {...props} />
		</Link>
	);
}
