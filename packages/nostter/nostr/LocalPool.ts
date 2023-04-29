import { isIndexedTagKey, getLocalRelayDexie, EventRecord } from "@/dexie/localRelay";
import { Collection, IndexableType, Table } from "dexie";
import invariant from "invariant";
import { CountPayload, Event, Filter, Sub, SubscriptionOptions } from "nostr-tools";

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

type DexieQuery = {
	equalityCriterias: EqualityCriterias;
	filter?: (event: Event) => boolean;
	limit?: number;
};

function filterToDexieQuery(filter: Filter): DexieQuery {
	const equalityCriterias: EqualityCriterias = {};

	let until: number | undefined;
	let limit: number | undefined;
	let multipleKinds: undefined | number[];

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
			if (arrayValue.length === 1) {
				invariant(typeof firstValue === 'number', 'kind must be a number');
				equalityCriterias.kind = firstValue;
				continue;
			} else if (arrayValue.length > 1) {
				multipleKinds = arrayValue as number[];
				continue;
			} else {
				invariant(false, 'kinds must not be empty');
			}
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

		if (key === 'until') {
			if (!firstValue) {
				continue;
			}

			until = firstValue as number;
			continue;
		}

		if (key === 'limit') {
			if (!firstValue) {
				continue;
			}

			limit = firstValue as number;
			continue;
		}

		invariant(false, `FIXME: Unsupported filter key: ${key}`);
	}

	return {
		equalityCriterias,
		filter: (until || multipleKinds) ? (event) => {
			let allPass = true;

			if (until !== undefined) {
				allPass &&= event.created_at <= until;
			}

			if (multipleKinds !== undefined) {
				allPass &&= multipleKinds.includes(event.kind);
			}

			return allPass;
		} : undefined,
		limit,
	};
}

function applyDexieQuery(
	table: Table<EventRecord, IndexableType>,
	{
		equalityCriterias,
		filter,
		limit,
	}: DexieQuery,
): Collection<EventRecord, IndexableType> {
	let result = table.where(equalityCriterias);

	if (filter) {
		result = result.filter(filter);
	}

	if (limit) {
		result = result.limit(limit);
	}

	return result;
}

type SubEvent = {
	event: (event: Event) => void | Promise<void>;
	count: (payload: CountPayload) => void | Promise<void>;
	eose: () => void | Promise<void>;
}

export class LocalPool {
	async get(_relays: string[], filter: Filter): Promise<Event | null> {
		const dexieQuery = filterToDexieQuery(filter);

		const localRelayDexie = await getLocalRelayDexie();

		const result = await applyDexieQuery(localRelayDexie.events, dexieQuery).first();

		return result ?? null;
	}

	async list(_relays: string[], filters: Filter[]): Promise<Event[]> {
		const dexieQueries = filters.map(filterToDexieQuery);

		const localRelayDexie = await getLocalRelayDexie();

		const queryResults = await Promise.all(dexieQueries.map(dexieQuery => {
			return applyDexieQuery(localRelayDexie.events, dexieQuery).toArray();
		}));

		return queryResults.flat();
	}

	sub(_relays: string[], filters: Filter[]): Sub {
		const seenEventIds = new Set<string>();

		const eventListeners: Set<(event: Event) => void> = new Set();
		const eoseListeners: Set<() => void> = new Set();

		let cancelled = false;

		(async () => {
			const dexieQueries = filters.map(filterToDexieQuery);

			const localRelayDexie = await getLocalRelayDexie();

			await Promise.all(dexieQueries.map(dexieQuery => {
				return applyDexieQuery(localRelayDexie.events, dexieQuery)
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
			on<T extends keyof SubEvent, U extends SubEvent[T]>(event: T, listener: U): void {
				if (event === 'event') {
					eventListeners.add(listener as (event: Event) => void);
				}

				if (event === 'eose') {
					eoseListeners.add(listener as () => void);
				}
			},

			off<T extends keyof SubEvent, U extends SubEvent[T]>(event: T, listener: U): void {
				if (event === 'event') {
					eventListeners.delete(listener as (event: Event) => void);
				}

				if (event === 'eose') {
					eoseListeners.delete(listener as () => void);
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

	async ensureRelay(_relay: string) {}
}
