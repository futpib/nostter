import { Event } from "nostr-tools";

export class EventSet {
	private _events = new Map<string, Event>();

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

	add(event: Event) {
		if (!this._events.has(event.id)) {
			this._events.set(event.id, event);
		}
	}

	get(id: string) {
		return this._events.get(id);
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
}
