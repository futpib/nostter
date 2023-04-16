import { isIndexedTagKey, getLocalRelayDexie } from "@/dexie/localRelay";
import invariant from "invariant";
import { Event, Filter, Sub, SubscriptionOptions } from "nostr-tools";

type EqualityCriterias = Partial<{
	id: string;
	pubkey: string;
	kind: number;
	created_at: number;

	tagIds: string[];

	aTag1s: string[];
	dTag1s: string[];
	eTag1s: string[];
	gTag1s: string[];
	iTag1s: string[];
	pTag1s: string[];
	rTag1s: string[];
	tTag1s: string[];
}>;

function filterToEqualityCriterias(filter: Filter): EqualityCriterias {
	const equalityCriterias: EqualityCriterias = {};

	for (const [ key, value ] of Object.entries(filter)) {
		if (value === undefined) {
			continue;
		}

		let firstValue: string | number;
		let arrayValue: (string | number)[];

		if (Array.isArray(value)) {
			firstValue = value[0];
			arrayValue = value;
		} else {
			firstValue = value;
			arrayValue = [ value ];
		}

		if (key === "ids") {
			invariant(arrayValue.length === 1, 'TODO: Support multiple ids');
			invariant(typeof firstValue === 'string', 'id must be a string');
			equalityCriterias.id = firstValue;
			continue;
		}

		if (key === "kinds") {
			invariant(arrayValue.length === 1, 'TODO: Support multiple kinds');
			invariant(typeof firstValue === 'number', 'kind must be a number');
			equalityCriterias.kind = firstValue;
			continue;
		}

		if (key === 'authors') {
			invariant(arrayValue.length === 1, 'TODO: Support multiple authors');
			invariant(typeof firstValue === 'string', 'author must be a string');
			equalityCriterias.pubkey = firstValue;
			continue;
		}

		if (key.startsWith('#') && key.length === 2) {
			const tag = key.slice(1);

			if (isIndexedTagKey(tag)) {
				equalityCriterias[`${tag}Tag1s`] = arrayValue as string[];
				continue;
			}
		}

		invariant(false, `FIXME: Unsupported filter key: ${key}`);
	}

	return equalityCriterias;
}

type SubEvent = {
	event: (event: Event) => void | Promise<void>;
	eose: () => void | Promise<void>;
}

export class LocalPool {
	async get(_relays: string[], filter: Filter): Promise<Event | null> {
		const equalityCriterias = filterToEqualityCriterias(filter);

		const localRelayDexie = await getLocalRelayDexie();

		const result = await localRelayDexie.events.where(equalityCriterias).first();

		return result ?? null;
	}

	sub(_relays: string[], filters: Filter[]): Sub {
		const seenEventIds = new Set<string>();

		const eventListeners: Set<(event: Event) => void> = new Set();
		const eoseListeners: Set<() => void> = new Set();

		let cancelled = false;

		(async () => {
			const equalityCriterias = filters.map(filterToEqualityCriterias);

			const localRelayDexie = await getLocalRelayDexie();

			await Promise.all(equalityCriterias.map(equalityCriterias => {
				return localRelayDexie.events
					.where(equalityCriterias)
					.until(() => cancelled)
					.each((event) => {
						if (seenEventIds.has(event.id)) {
							return;
						}

						seenEventIds.add(event.id);

						for (const listener of eventListeners) {
							listener(event);
						}
					});
			}));

			for (const listener of eoseListeners) {
				listener();
			}
		})();

		return {
			on<K extends keyof SubEvent>(event: K, callback: SubEvent[K]): void {
				if (event === 'event') {
					eventListeners.add(callback);
				}

				if (event === 'eose') {
					eoseListeners.add(callback as () => void);
				}
			},

			off<K extends keyof SubEvent>(event: K, callback: SubEvent[K]): void {
				if (event === 'event') {
					eventListeners.delete(callback);
				}

				if (event === 'eose') {
					eoseListeners.delete(callback as () => void);
				}
			},

			sub(_filters: Filter[], opts_: SubscriptionOptions): Sub {
				invariant(false, 'FIXME: Not implemented');
			},

			unsub(): void {
				cancelled = true;
			},
		};
	}
}
