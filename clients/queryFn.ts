import { EVENT_KIND_METADATA, EVENT_KIND_REACTION, EVENT_KIND_REPOST, EVENT_KIND_SHORT_TEXT_NOTE } from "@/constants/eventKinds";
import { localRelayDexie } from "@/dexie/localRelay";
import { FullQueryKey } from "@/hooks/useAppQuery";
import { EventSet } from "@/nostr/EventSet";
import { getPublicRuntimeConfig } from "@/utils/getPublicRuntimeConfig";
import { QueryFunction } from "@tanstack/react-query";
import invariant from "invariant";
import { Event, Filter, SimplePool } from "nostr-tools";
import { PrehashedQueryKey, unprehashQueryKey } from "./prehashQueryKey";

export const simplePool = new SimplePool({
	eoseSubTimeout: 10000,
	getTimeout: 10000,
});

async function apiQueryFn(abortSignal: AbortSignal, queryKey: FullQueryKey): Promise<EventSet> {
	const [ preferences, backend, network, parameters, ...resource ] = queryKey;

	invariant(backend === 'api', 'apiQueryFn called with non-api backend');
	invariant(network === 'nostr', 'apiQueryFn called with non-nostr network');

	// TODO: preferences

	const [ resourceType, resourceId, subresource ] = resource;

	invariant(resourceId, 'apiQueryFn called with no resource ID');

	const { publicUrl } = getPublicRuntimeConfig();

	const url = new URL(`${publicUrl}/api/${resourceType}/${resourceId}`);

	if (subresource) {
		url.pathname += `/${subresource}`;
	}

	for (const relay of parameters.relays) {
		url.searchParams.append('relays', relay);
	}

	const urlString = url.toString();

	const response = await fetch(urlString, {
		signal: abortSignal,
	});
	const json = await response.json();

	const eventSet = new EventSet();

	if ('events' in json) {
		for (const event of json.events) {
			eventSet.add(event);
		}
	}

	if ('event' in json) {
		eventSet.add(json.event);
	}

	return eventSet;
}

function getPoolQueryFilter(resourceType: unknown, resourceId: string, subresource: unknown) {
	const filter: Filter = {};

	if (resourceType === 'event') {
		filter.ids = [ resourceId ];

		if (!subresource) {
			filter.kinds = [ EVENT_KIND_SHORT_TEXT_NOTE ];
			return filter;
		}

		if (subresource === 'descendants') {
			filter.kinds = [ EVENT_KIND_SHORT_TEXT_NOTE ];
			filter['#e'] = [ resourceId ];
			return filter;
		}

		if (subresource === 'reposts') {
			filter.kinds = [ EVENT_KIND_REPOST ];
			filter['#e'] = [ resourceId ];
			return filter;
		}

		if (subresource === 'reactions') {
			filter.kinds = [ EVENT_KIND_REACTION ];
			filter['#e'] = [ resourceId ];
			return filter;
		}
	}

	if (resourceType === 'pubkey') {
		filter.authors = [ resourceId ];

		if (subresource === 'metadata') {
			filter.kinds = [ EVENT_KIND_METADATA ];
			return filter;
		}
	}

	invariant(false, 'getPoolQueryFilter cannot handle these arguments: %s %s %s', resourceType, resourceId, subresource);
}

async function list(simplePool: SimplePool, abortSignal: AbortSignal, relays: string[], filters: Filter[]) {
	return new Promise<EventSet>(resolve => {
		const eventSet = new EventSet();
		const sub = simplePool.sub(relays, filters);

		sub.on('event', (event) => {
			eventSet.add(event);
		});

		const finish = () => {
			sub.unsub()
			resolve(eventSet)
		};

		sub.on('eose', finish);

		abortSignal.addEventListener('abort', finish);
	});
}

async function poolQueryFn(abortSignal: AbortSignal, queryKey: FullQueryKey): Promise<EventSet> {
	const [ preferences, backend, network, parameters, ...resource ] = queryKey;

	invariant(backend === 'pool', 'poolQueryFn called with non-pool backend');
	invariant(network === 'nostr', 'poolQueryFn called with non-nostr network');

	const [ resourceType, resourceId, subresource ] = resource;

	invariant(resourceId, 'poolQueryFn called with no resource ID');

	const relays = [...new Set([...preferences.relays, ...parameters.relays])].sort();

	const filter = getPoolQueryFilter(resourceType, resourceId, subresource);

	const eventSet = await list(simplePool, abortSignal, relays, [ filter ]);

	return eventSet;
}

async function queryLocalRelayDexie(abortSignal: AbortSignal, resourceType: unknown, resourceId: string, subresource: unknown): Promise<Event[]> {
	if (resourceType === 'event') {
		if (!subresource) {
			return localRelayDexie.events.where({
				id: resourceId,
				kind: EVENT_KIND_SHORT_TEXT_NOTE,
			}).toArray();
		}

		if (subresource === 'descendants') {
			const tags = await localRelayDexie.tags.where({
				_0: 'e',
				_1: resourceId,
			}).toArray();

			if (abortSignal.aborted) {
				return [];
			}

			return localRelayDexie.events.where({
				tagIds: tags.map(tag => tag.id),
				kind: EVENT_KIND_SHORT_TEXT_NOTE,
			}).toArray();
		}

		if (subresource === 'reposts') {
			const tags = await localRelayDexie.tags.where({
				_0: 'e',
				_1: resourceId,
			}).toArray();

			if (abortSignal.aborted) {
				return [];
			}

			return localRelayDexie.events.where({
				tagIds: tags.map(tag => tag.id),
				kind: EVENT_KIND_REPOST,
			}).toArray();
		}

		if (subresource === 'reactions') {
			const tags = await localRelayDexie.tags.where({
				_0: 'e',
				_1: resourceId,
			}).toArray();

			if (abortSignal.aborted) {
				return [];
			}

			return localRelayDexie.events.where({
				tagIds: tags.map(tag => tag.id),
				kind: EVENT_KIND_REACTION,
			}).toArray();
		}
	}

	if (resourceType === 'pubkey') {
		if (subresource === 'metadata') {
			return localRelayDexie.events.where({
				pubkey: resourceId,
				kind: EVENT_KIND_METADATA,
			}).toArray();
		}
	}

	invariant(false, 'localQueryFn cannot handle these arguments: %s %s %s', resourceType, resourceId, subresource);
}

async function localQueryFn(abortSignal: AbortSignal, queryKey: FullQueryKey): Promise<EventSet> {
	const [ preferences, backend, network, parameters, ...resource ] = queryKey;

	invariant(backend === 'local', 'localQueryFn called with non-local backend');
	invariant(network === 'nostr', 'localQueryFn called with non-nostr network');

	const [ resourceType, resourceId, subresource ] = resource;

	invariant(resourceId, 'localQueryFn called with no resource ID');

	const events = await queryLocalRelayDexie(abortSignal, resourceType, resourceId, subresource);

	const eventSet = new EventSet();

	for (const event of events) {
		eventSet.add(event);
	}

	return eventSet;
}

export const queryFn: QueryFunction<EventSet, PrehashedQueryKey> = ({ queryKey: prehashedQueryKey, signal: abortSignal }): Promise<EventSet> => {
	invariant(abortSignal, 'queryFn called without abortSignal');

	const queryKey = unprehashQueryKey(prehashedQueryKey);

	const [ _preferences, backend ] = queryKey;

	if (backend === 'api') {
		return apiQueryFn(abortSignal, queryKey);
	}

	if (backend === 'pool') {
		return poolQueryFn(abortSignal, queryKey);
	}

	if (backend === 'local') {
		return localQueryFn(abortSignal, queryKey);
	}

	invariant(false, 'queryFn cannot handle this backend: %s', backend);
}