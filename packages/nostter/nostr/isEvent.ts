import { Event } from 'nostr-tools';
import { EventPointer } from 'nostr-tools/lib/nip19';

export function isEvent(x: unknown): x is Event {
	return Boolean(
		typeof x === 'object'
			&& x
			&& typeof (x as Event).id === 'string'
			&& typeof (x as Event).kind === 'number'
			&& typeof (x as Event).content === 'string'
			&& typeof (x as Event).created_at === 'number'
	);
}

export function isEventPointer(x: unknown): x is EventPointer {
	return Boolean(
		typeof x === 'object'
			&& x
			&& typeof (x as EventPointer).id === 'string'
	);
}
