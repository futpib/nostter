import { isIndexedTagKey, getLocalRelayDexie, EventRecord } from "@/dexie/localRelay";
import { debugExtend } from "@/utils/debugExtend";
import { Collection, IndexableType, Table } from "dexie";
import invariant from "invariant";
import { CountPayload, Event, Filter, Sub, SubscriptionOptions } from "nostr-tools";

const log = debugExtend('nostr', 'localPool');

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

type DexieQueryByEqualityCriterias = {
	type: 'DexieQueryByEqualityCriterias';
	equalityCriterias: EqualityCriterias;
	filter?: (event: Event) => boolean;
	limit?: number;
};

function filterToDexieQueryByEqualityCriterias(filter: Filter): DexieQueryByEqualityCriterias {
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
				if (arrayValue.length === 0) {
					continue;
				}

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
		type: 'DexieQueryByEqualityCriterias',
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

type DexieQueryByCreatedAt = {
	type: 'DexieQueryByCreatedAt';
	filter?: (event: Event) => boolean;
	limit: number;
};

type DexieQuery =
	| DexieQueryByEqualityCriterias
	| DexieQueryByCreatedAt;

function filterToDexieQueryByCreatedAt(filter: Filter): DexieQueryByCreatedAt {
	let until: number | undefined;
	let multipleIds: undefined | Set<string>;
	let multipleKinds: undefined | Set<number>;
	let multipleAuthors: undefined | Set<string>;

	invariant(filter.limit !== undefined, 'limit must be defined');

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
			multipleIds = new Set(arrayValue as string[]);
			continue;
		}

		if (key === "kinds") {
			multipleKinds = new Set(arrayValue as number[]);
			continue;
		}

		if (key === 'authors') {
			multipleAuthors = new Set(arrayValue as string[]);
			continue;
		}

		if (key === 'until') {
			if (!firstValue) {
				continue;
			}

			until = firstValue as number;
			continue;
		}

		if (key === 'limit') {
			continue;
		}

		invariant(false, `FIXME: Unsupported filter key: ${key}`);
	}

	return {
		type: 'DexieQueryByCreatedAt',
		filter: (until || multipleKinds || multipleIds) ? (event) => {
			let allPass = true;

			if (until !== undefined) {
				allPass &&= event.created_at <= until;
			}

			if (multipleIds !== undefined) {
				allPass &&= multipleIds.has(event.id);
			}

			if (multipleKinds !== undefined) {
				allPass &&= multipleKinds.has(event.kind);
			}

			if (multipleAuthors !== undefined) {
				allPass &&= multipleAuthors.has(event.pubkey);
			}

			return allPass;
		} : undefined,
		limit: filter.limit,
	};
}

function filterToDexieQuery(filter: Filter): DexieQuery {
	if (
		filter.authors
			&& filter.authors.length > 1
			&& filter.limit !== undefined
			&& filter.until !== undefined
	) {
		return filterToDexieQueryByCreatedAt(filter);
	}

	return filterToDexieQueryByEqualityCriterias(filter);
}

function applyDexieQuery(
	table: Table<EventRecord, IndexableType>,
	dexieQuery: DexieQuery,
): Collection<EventRecord, IndexableType> {
	if (dexieQuery.type === 'DexieQueryByCreatedAt') {
		const { limit, filter } = dexieQuery;

		let result = table.orderBy('created_at')

		if (filter) {
			result = result.filter(filter);
		}

		return result.limit(limit).reverse();
	} else if (dexieQuery.type === 'DexieQueryByEqualityCriterias') {
		const { equalityCriterias, filter, limit } = dexieQuery;

		let result = table.where(equalityCriterias);

		if (filter) {
			result = result.filter(filter);
		}

		if (limit) {
			result = result.limit(limit);
		}

		return result;
	} else {
		invariant(false, `FIXME: Unsupported dexieQuery type: ${(dexieQuery as any).type}`);
	}
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

		const result = queryResults.flat();

		log('list', filters, result);

		return result;
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
