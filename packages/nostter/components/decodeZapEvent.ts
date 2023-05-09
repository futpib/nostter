import bolt11 from 'bolt11';
import { Event } from 'nostr-tools';
import { EventPointer } from 'nostr-tools/lib/nip19';

export function decodeZapEvent(event: Event, zappedEventPointer?: EventPointer) {
	const [ _1, zappedEventId ] = event.tags.findLast(tag => tag[0] === 'e') ?? [];

	if (zappedEventPointer && zappedEventId !== zappedEventPointer.id) {
		return;
	}

	const bolt11Tag = event.tags.find(tag => tag[0] === 'bolt11');

	if (!bolt11Tag) {
		return;
	}

	const [ _2, bolt11String ] = bolt11Tag;

	return bolt11.decode(bolt11String);
}
