import invariant from "invariant";
import { Event as Event_, Filter as Filter_, Kind, matchFilter } from "nostr-tools";
import { EventKind } from "./EventKind";

type Event = Event_<number>;

type Filter = Filter_ | {
	kinds?: Kind[] | EventKind[];
};

function uniqueSortedArrayBinarySearchInsert(array: number[], value: number) {
	let low = 0;
	let high = array.length - 1;

	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		const midValue = array[mid];

		if (midValue === value) {
			return;
		}

		if (midValue < value) {
			low = mid + 1;
		} else {
			high = mid - 1;
		}
	}

	array.splice(low, 0, value);
}

class EventSetPoolLike {
	constructor(private _eventSet: EventSet) {}

	get(filter: Filter): undefined | Event {
		for (const event of this._eventSet) {
			if (matchFilter(filter, event)) {
				return event;
			}
		}

		return undefined;
	}

	list(filters: Filter[]): Event[] {
		const events: Event[] = [];

		for (const event of this._eventSet) {
			if (filters.every(filter => matchFilter(filter, event))) {
				events.push(event);
			}
		}

		return events;
	}
}

export type EventSetJSON = Event[][];

export class EventSet {
	private _events = new Map<string, Event>();
	private _eventsByCreatedAt = new Map<number, Event[]>();
	private _createdAtOrder: number[] = [];

	get size() {
		return this._events.size;
	}

	/**
	 * @deprecated Use `Array.from(eventSet)` instead
	 */
	get events() {
		return Array.from(this);
	}

	/**
	 * @deprecated Use `eventSet.toEvent()` or `eventSet.getLatestEvent()` instead
	 */
	get event(): undefined | Event {
		return this.toEvent();
	}

	get poolLike() {
		return new EventSetPoolLike(this);
	}

	[Symbol.iterator]() {
		return this._events.values();
	}

	clone() {
		const clone = new EventSet();

		for (const event of this._events.values()) {
			clone.add(event);
		}

		return clone;
	}

	toJSON(): EventSetJSON {
		return this._createdAtOrder.map(createdAt => {
			const events = this._eventsByCreatedAt.get(createdAt);

			invariant(
				events,
				"No events in `_eventsByRcreatedAt` at `createdAt === %s` which is in the `_createdAtOrder`.",
				createdAt,
			);

			return events;
		});
	}

	static fromJSON(json: any) {
		if (json instanceof EventSet) {
			return json.clone();
		}

		const eventSet = new EventSet();

		for (const eventGroup of json) {
			for (const event of eventGroup) {
				eventSet._events.set(event.id, event);
			}

			const firstEvent = eventGroup[0];

			eventSet._eventsByCreatedAt.set(firstEvent.created_at, eventGroup);
			eventSet._createdAtOrder.push(firstEvent.created_at);
		}

		return eventSet;
	}

	add(event: Event) {
		if (!this._eventsByCreatedAt.has(event.created_at)) {
			this._eventsByCreatedAt.set(event.created_at, []);
		}

		if (!this._events.has(event.id)) {
			this._events.set(event.id, event);
			this._eventsByCreatedAt.get(event.created_at)!.push(event);
			uniqueSortedArrayBinarySearchInsert(this._createdAtOrder, event.created_at);
		}
	}

	has(id: string) {
		return this._events.has(id);
	}

	get(id: string) {
		return this._events.get(id);
	}

	filter(filter: Filter) {
		const eventSet = new EventSet();

		for (const event of this) {
			if (matchFilter(filter, event)) {
				eventSet.add(event);
			}
		}

		return eventSet;
	}

	toEvent(): undefined | Event {
		if (this._events.size !== 1) {
			return undefined;
		}

		return this._events.values().next().value;
	}

	getLatestEvent(): undefined | Event {
		let latestEvent: undefined | Event;

		for (const event of this._events.values()) {
			if (!latestEvent || event.created_at > latestEvent.created_at) {
				latestEvent = event;
			}
		}

		return latestEvent;
	}

	getOldestEvent(): undefined | Event {
		let oldestEvent: undefined | Event;

		for (const event of this._events.values()) {
			if (!oldestEvent || event.created_at < oldestEvent.created_at) {
				oldestEvent = event;
			}
		}

		return oldestEvent;
	}

	getEventsLatestFirst() {
		return this._createdAtOrder
			.slice()
			.reverse()
			.flatMap(createdAt => this._eventsByCreatedAt.get(createdAt)!)
		;
	}

	getEventsOldestFirst() {
		return this._createdAtOrder
			.flatMap(createdAt => this._eventsByCreatedAt.get(createdAt)!)
		;
	}
}
