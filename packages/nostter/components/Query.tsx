"use client";

import { defaultRelays } from "@/constants/defaultRelays";
import { simplePool } from "@/utils/simplePool";
import classNames from "classnames";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Event, Filter, nip19 } from "nostr-tools";
import { DecodeResult } from "nostr-tools/lib/nip19";
import plur from "plur";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./Query.module.css";

type Query = Filter<number>[];

function stringifyQuery(query: Query) {
	return JSON.stringify(query, null, 2);
}

function parseQuery(query: string): Query {
	const errors: unknown[] = [];

	try {
		return JSON.parse(query);
	} catch (error) {
		errors.push(error);
	}

	let decodeResult: undefined | DecodeResult;

	if (query.startsWith('n')) {
		try {
			decodeResult = nip19.decode(query);
		} catch (error) {
			errors.push(error);
		}
	}

	if (decodeResult) {
		if (decodeResult.type === 'nprofile') {
			return [
				{
					authors: [ decodeResult.data.pubkey ],
				},
			];
		}

		if (decodeResult.type === 'nevent') {
			return [
				{
					ids: [ decodeResult.data.id ],
				},
			];
		}

		if (decodeResult.type === 'naddr') {
			return [
				{
					ids: [ decodeResult.data.pubkey ],
				},
			];
		}

		if (decodeResult.type === 'npub') {
			return [
				{
					authors: [ decodeResult.data ],
				},
			];
		}

		if (decodeResult.type === 'note') {
			return [
				{
					ids: [ decodeResult.data ],
				},
			];
		}
	}

	if (errors.length === 0) {
		throw new Error('Unknown error');
	}

	if (errors.length === 1) {
		throw errors[0];
	}

	throw new Error(errors.map(stringifyError).join('\n'));
}

function hashQuery(query: Query) {
	return JSON.stringify(query);
}

type EventRow = {
	type: 'event';
	event: Event;
};

type EoseRow = {
	type: 'eose';
};

type Row = EventRow | EoseRow;

function stringifyEvent(event: Event) {
	return JSON.stringify(event, null, 2);
}

function stringifyError(error: unknown) {
	console.error(error);

	if (error instanceof Error) {
		return error.message;
	}

	return 'Some weird error';
}

const defaultQueryString = stringifyQuery([
	{
		ids: [
			'000000000',
		],
	},
]);

export function Query() {
	const didScrollToHashRef = useRef(false);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const qBase64 = searchParams?.get('q');

	const [ query, setQuery ] = useState(
		typeof qBase64 === 'string'
		? atob(qBase64)
		: defaultQueryString
	);

	const [ relays, setRelays ] = useState(defaultRelays);

	const relaysNormalized = useMemo(() => {
		return [ ...new Set(relays) ].sort();
	}, [ relays ]);

	const [ queryParsed, queryParseError ] = useMemo((): [ undefined | Query, unknown ] => {
		try {
			return [ parseQuery(query), undefined ];
		} catch (error) {
			return [ undefined, error ];
		}
	}, [ query ]);

	const handleQueryChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
		const query = event.target.value;
		setQuery(query);
	}, [ searchParams ]);

	const [ rows, setRows ] = useState<Row[]>([]);

	useEffect(() => {
		if (!queryParsed) {
			return;
		}

		let gotSomeResults = false;

		setRows([]);

		const sub = simplePool.sub(relaysNormalized, queryParsed);

		const handleSomeResults = () => {
			if (gotSomeResults) {
				return;
			}

			gotSomeResults = true;

			const query_ = stringifyQuery(queryParsed);

			if (query === query_) {
				return;
			}

			setQuery(query_);

			router.push(pathname + '?' + new URLSearchParams({
				q: btoa(query),
			}));
		};

		const handleEvent = (event: Event) => {
			setRows(rows => rows.concat({
				type: 'event',
				event,
			}));

			handleSomeResults();
		};

		const handleEose = () => {
			setRows(rows => rows.concat({
				type: 'eose',
			}));

			handleSomeResults();
		};

		sub.on('event', handleEvent);
		sub.on('eose', handleEose);

		return () => {
			sub.off('event', handleEvent);
			sub.off('eose', handleEose);
			sub.unsub();
		};
	}, [ queryParsed ? hashQuery(queryParsed) : '', relaysNormalized ]);

	const createHandleEventClick = (event: Event) => {
		return () => {
			window.location.hash = event.id;
		};
	};

	const handleEoseClick = () => {
		window.location.hash = 'eose';
	};

	const createHandleRef = (id: string) => {
		return (element: HTMLDivElement | null) => {
			if (!element) {
				return;
			}

			if (didScrollToHashRef.current) {
				return;
			}

			if (window.location.hash === '#' + id) {
				element.scrollIntoView();
				didScrollToHashRef.current = true;
			}
		};
	};

	const hash = window.location.hash.slice(1);

	return (
		<div
			className={styles.query}
		>
			<textarea
				className={styles.textarea}
				value={query}
				onChange={handleQueryChange}
			/>

			{Boolean(queryParseError) && (
				<div className={styles.error}>
					{stringifyError(queryParseError)}
				</div>
			)}

			<div className={styles.count}>
				Got {rows.length} {plur('message', rows.length)}
			</div>

			<div className={styles.rows}>
				{rows.map(row => (
					row.type === 'event' ? (
						<div
							ref={createHandleRef(row.event.id)}
							className={classNames(
								styles.row,
								hash === row.event.id && styles.rowHighlighted,
								styles.eventRow,
							)}
							id={row.event.id}
							key={row.event.id}
							onClick={createHandleEventClick(row.event)}
						>
							{stringifyEvent(row.event)}
						</div>
					) : (
						<div
							ref={createHandleRef('eose')}
							className={classNames(
								styles.row,
								hash === 'eose' && styles.rowHighlighted,
								styles.eose,
							)}
							id="eose"
							key="eose"
							onClick={handleEoseClick}
						>
							EOSE (End of stored events)
						</div>
					)
				))}
			</div>
		</div>
	);
}
