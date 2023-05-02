import { EventSet } from "@/nostr/EventSet";
import { Query, QueryKey } from "@tanstack/react-query";
import invariant from "invariant";
import { handleSuccess } from "./handleSuccess";
import { TRPCMeta, TRPCMetaCacheControl } from "@/trpc/meta";
import { Event } from "nostr-tools";
import { trpcUniversalRouter } from "@/trpc/router/universal";

function setCacheTimeFromMeta(query: Query, queryKey: QueryKey, data: EventSet) {
	const path = queryKey[0] as string[];

	let router: any = trpcUniversalRouter;

	for (const segment of path) {
		router = router[segment];
	}

	const meta = router.meta as undefined | TRPCMeta;

	let cacheTime: undefined | number = undefined;

	if (meta?.cacheControl) {
		if ('empty' in meta.cacheControl || 'nonEmpty' in meta.cacheControl) {
			const { empty, nonEmpty } = meta.cacheControl;

			if (data.size === 0) {
				if (empty?.maxAge !== undefined) {
					cacheTime = empty.maxAge.toMillis();
				}
			} else {
				if (nonEmpty?.maxAge !== undefined) {
					cacheTime = nonEmpty.maxAge.toMillis();
				}
			}
		} else {
			const cacheControl = meta.cacheControl as TRPCMetaCacheControl;

			if (cacheControl.maxAge !== undefined) {
				cacheTime = cacheControl.maxAge.toMillis();
			}
		}
	}

	if (cacheTime !== undefined) {
		query.cacheTime = cacheTime;
	}
}

export function handleTRPCSuccess(query: Query, queryKey: QueryKey, data: unknown) {
	if (data && typeof data === 'object' && 'pages' in data) {
		const pages = (data as any).pages as { eventSet: EventSet }[];

		for (const page of pages) {
			invariant(page.eventSet instanceof EventSet, "page.eventSet must be an EventSet");

			setCacheTimeFromMeta(query, queryKey, page.eventSet);
		}

		return;
	}

	invariant(data instanceof EventSet, "data must be an EventSet");

	setCacheTimeFromMeta(query, queryKey, data);

	handleSuccess(data);
}

export function handleTRPCSubscriptionData(data: unknown) {
	invariant(
		typeof data === 'object'
			&& data
			&& 'id' in data
			&& typeof data.id === 'string',
		'data does not have a string id',
	);

	const eventSet = new EventSet();

	eventSet.add(data as Event);

	handleSuccess(eventSet);
}
