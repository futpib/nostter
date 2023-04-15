import { EventSet } from "@/nostr/EventSet";
import { Query, QueryKey } from "@tanstack/react-query";
import invariant from "invariant";
import { handleSuccess } from "./handleSuccess";
import { trpcRouter } from "@/trpc/router";
import { TRPCMeta, TRPCMetaCacheControl } from "@/trpc/meta";

function setCacheTimeFromMeta(query: Query, queryKey: QueryKey, data: EventSet) {
	const path = queryKey[0] as string[];

	let router: any = trpcRouter;

	for (const segment of path) {
		router = router[segment];
	}

	const meta = router.meta as TRPCMeta;

	let cacheTime: undefined | number = undefined;

	if (meta.cacheControl) {
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
	invariant(data instanceof EventSet, "data must be an EventSet");

	setCacheTimeFromMeta(query, queryKey, data);

	handleSuccess(data);
}
