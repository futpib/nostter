import { isIndexedTagKey, getLocalRelayDexie, EventRecord, LocalRelayDexie } from "@/dexie/localRelay";
import { debugExtend } from "@/utils/debugExtend";
import { Collection, IndexableType, Table } from "dexie";
import invariant from "invariant";
import { CountPayload, Event, Filter, Sub, SubscriptionOptions } from "nostr-tools";

const log = debugExtend('nostr', 'localPool');

const filterReplacements = new WeakMap<Function, Record<string, any>>();

function getFilterDebugString(filter: Function) {
	let debugString = filter.toString();

	const replacements = filterReplacements.get(filter) ?? {};

	for (const [ key, value ] of Object.entries(replacements)) {
		debugString = debugString.replaceAll(key, JSON.stringify(value, (_key, value) => {
			if (value instanceof Set) {
				return `new Set(${JSON.stringify([ ...value ])})`;
			}

			return value;
		}, 2));
	}

	return debugString;
}

function buildFilterFunction({
	until,
	multipleKinds,
	multipleIds,
	multipleAuthors,
}: {
	until?: number;
	multipleKinds?: Set<number>;
	multipleIds?: Set<string>;
	multipleAuthors?: Set<string>;
}) {
	if (
		until === undefined
			&& multipleKinds === undefined
			&& multipleIds === undefined
			&& multipleAuthors === undefined
	) {
		return undefined;
	}

	const filter = (event: Event) => {
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
	};

	filterReplacements.set(filter, {
		until,
		multipleIds,
		multipleKinds,
		multipleAuthors,
	});

	return filter;
}

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
	let multipleKinds: undefined | Set<number>;

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
				multipleKinds = new Set(arrayValue as number[]);
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
		filter: buildFilterFunction({
			until,
			multipleKinds,
		}),
		limit,
	};
}

type DexieQueryByCreatedAt = {
	type: 'DexieQueryByCreatedAt';
	filter?: (event: Event) => boolean;
	limit: number;
	until?: number;
};

type DexieQuery =
	| DexieQueryByEqualityCriterias
	| DexieQueryByCreatedAt;

function getDexieQueryDebugString(dexieQuery: DexieQuery) {
	return JSON.stringify(dexieQuery, (key, value) => {
		if (key === 'filter') {
			const value_ = value as DexieQuery['filter'];
			return value_ ? getFilterDebugString(value) : value_;
		}

		return value;
	}, 2);
}

function filterToDexieQueryByCreatedAt(filter: Filter): DexieQueryByCreatedAt {
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

		if (key === 'limit') {
			continue;
		}

		if (key === 'until') {
			continue;
		}

		invariant(false, `FIXME: Unsupported filter key: ${key}`);
	}

	return {
		type: 'DexieQueryByCreatedAt',
		filter: buildFilterFunction({
			multipleIds,
			multipleKinds,
			multipleAuthors,
		}),
		limit: filter.limit,
		until: filter.until,
	};
}

function filterToDexieQuery(filter: Filter): DexieQuery {
	if (filter.limit !== undefined) {
		return filterToDexieQueryByCreatedAt(filter);
	}

	return filterToDexieQueryByEqualityCriterias(filter);
}

function applyDexieQuery(
	table: Table<EventRecord, IndexableType>,
	dexieQuery: DexieQuery,
): Collection<EventRecord, IndexableType> {
	if (dexieQuery.type === 'DexieQueryByCreatedAt') {
		const { limit, until, filter } = dexieQuery;

		let result: Collection<EventRecord, IndexableType>;
		let debugString = '';

		if (until !== undefined) {
			result = table.where('created_at').below(until).reverse();
			debugString += `table.where('created_at').below(${until})`;
		} else {
			result = table.orderBy('created_at').reverse();
			debugString += `table.orderBy('created_at').reverse()`;
		}

		if (filter) {
			result = result.filter(filter);
			debugString += `.filter(filter)`;
		}

		result = result.limit(limit);
		debugString += `.limit(${limit})`;

		log('applyDexieQuery', getDexieQueryDebugString(dexieQuery), debugString);

		return result;
	} else if (dexieQuery.type === 'DexieQueryByEqualityCriterias') {
		const { equalityCriterias, filter, limit } = dexieQuery;

		let result = table.where(equalityCriterias);
		let debugString = `table.where(${JSON.stringify(equalityCriterias)})`;

		if (filter) {
			result = result.filter(filter);
			debugString += `.filter(filter)`;
		}

		if (limit) {
			result = result.limit(limit);
			debugString += `.limit(${limit})`;
		}

		log('applyDexieQuery', getDexieQueryDebugString(dexieQuery), debugString);

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
	constructor(
		private readonly _localRelayDexie?: LocalRelayDexie,
	) {}

	private _getLocalRelayDexie(): Promise<LocalRelayDexie> {
		if (this._localRelayDexie) {
			return Promise.resolve(this._localRelayDexie);
		}

		return getLocalRelayDexie();
	}

	async get(_relays: string[], filter: Filter): Promise<Event | null> {
		const dexieQuery = filterToDexieQuery(filter);

		const localRelayDexie = await this._getLocalRelayDexie();

		const result = await applyDexieQuery(localRelayDexie.events, dexieQuery).first();

		log('get', filter, result);

		return result ?? null;
	}

	async list(_relays: string[], filters: Filter[]): Promise<Event[]> {
		const dexieQueries = filters.map(filterToDexieQuery);

		const localRelayDexie = await this._getLocalRelayDexie();

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

			const localRelayDexie = await this._getLocalRelayDexie();

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
