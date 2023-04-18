import { EventSet } from '@/nostr/EventSet';
import superjson from 'superjson';

superjson.registerCustom({
	isApplicable(x: unknown): x is EventSet {
		return x instanceof EventSet;
	},

	serialize(eventSet: EventSet) {
		return eventSet.toJSON();
	},

	deserialize(v) {
		return EventSet.fromJSON(v);
	},
}, 'EventSet');

export const transformer = superjson;
