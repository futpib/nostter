import { ComponentProps } from 'react';
import { EmbeddedNote } from './EmbeddedNote';
import Link from 'next/link';
import { nip19 } from 'nostr-tools';

export function EmbeddedNoteLink(props: ComponentProps<typeof EmbeddedNote>) {
	const { id } = props;

	return (
		<Link href={`/note/${nip19.noteEncode(id)}`}>
			<EmbeddedNote {...props} />
		</Link>
	);
}
