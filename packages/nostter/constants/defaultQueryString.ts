import { Filter } from "nostr-tools";

export type Query = Filter<number>[];

export function stringifyQuery(query: Query) {
	return JSON.stringify(query, null, 2);
}

export const defaultQueryString = stringifyQuery([
	{
		ids: [
			'000000000',
		],
	},
]);
