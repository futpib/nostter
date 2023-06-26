"use client";

import { Query as Filters, defaultQueryString } from "@/constants/defaultQueryString";
import { defaultRelays } from "@/constants/defaultRelays";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useLocationHash } from "@/hooks/useLocationHash";
import { simplePool as simplePoolBase } from "@/utils/simplePool";
import classNames from "classnames";
import { DateTime } from "luxon";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Event, Filter, nip19, SimplePool } from "nostr-tools";
import { DecodeResult } from "nostr-tools/lib/nip19";
import plur from "plur";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./Query.module.css";

function normalizeUrl(url: string) {
	return new URL(url).toString();
}

function urlEquals(url1: string, url2: string) {
	return normalizeUrl(url1) === normalizeUrl(url2);
}

function stringifyQuery(query: Filters) {
	return JSON.stringify(query, null, 2);
}

function parseQuery(query: string): Filters {
	const errors: unknown[] = [];

	let parseResult: undefined | Filters | Filter;

	try {
		parseResult = JSON.parse(query);
	} catch (error) {
		errors.push(error);
	}

	if (!Array.isArray(parseResult) && typeof parseResult === 'object' && parseResult !== null) {
		parseResult = [ parseResult ];
	}

	if (parseResult) {
		return parseResult;
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

function hashQuery(query: Filters) {
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

function prettyEventString(event: Event) {
	return JSON.stringify({
		note: nip19.noteEncode(event.id),

		nevent: nip19.neventEncode({
			id: event.id,
			author: event.pubkey,
		}),

		npub: nip19.npubEncode(event.pubkey),

		created_at_iso: DateTime.fromSeconds(event.created_at).toISO(),
		created_at_locale: DateTime.fromSeconds(event.created_at).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS),
	}, null, 2);
}

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

// @ts-expect-error
class SimplePoolPrivate extends SimplePool {
	_seenOn!: Record<string, undefined | Set<string>>;
};

const simplePool = simplePoolBase as unknown as SimplePoolPrivate;

export function Query() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const qBase64 = searchParams?.get('q');

	const [ query, setQuery ] = useState(
		typeof qBase64 === 'string'
		? Buffer.from(qBase64, 'base64').toString('utf8')
		: defaultQueryString,
	);

	const [ localStorageRelays, setLocalStorageRelays ] = useLocalStorage<Record<string, undefined | boolean>>({
		key: 'relays',
	});

	const relays = useMemo(() => {
		const relays = new Map(defaultRelays.map(url => [ normalizeUrl(url), true ]));

		for (const [ url, enabled ] of Object.entries(localStorageRelays ?? {})) {
			relays.set(normalizeUrl(url), Boolean(enabled));
		}

		return relays;
	}, [ localStorageRelays ]);

	const relaysArray = useMemo(() => {
		return Array.from(relays.entries()).flatMap(([ url, enabled ]) => enabled ? [ url ] : []).sort();
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
		simplePool._seenOn = {};

		const sub = simplePool.sub(relaysArray, queryParsed);

		const handleSomeResults = () => {
			if (gotSomeResults) {
				return;
			}

			gotSomeResults = true;

			const query_ = stringifyQuery(queryParsed);

			if (query_ !== query) {
				setQuery(query_);
			}

			const qBase64_ = Buffer.from(query_, 'utf8').toString('base64');

			if (qBase64_ !== qBase64) {
				router.push(pathname + '?' + new URLSearchParams({
					q: qBase64_,
				}));
			}
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
	}, [ queryParsed ? hashQuery(queryParsed) : '', relaysArray ]);

	const {
		hash,
		setHash,
	} = useLocationHash();

	const createHandleEventClick = (event: Event) => {
		return () => {
			setHash(event.id);
		};
	};

	const handleEoseClick = () => {
		setHash('eose');
	};

	const [ intervalTickCounts, setIntervalTickCounts ] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setIntervalTickCounts(intervalTickCounts => intervalTickCounts + 1);
		}, 5000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	const eventRelayCounts = useMemo(() => {
		const seenOn = simplePool._seenOn;

		const eventRelayCounts: Record<string, number> = {};

		for (const [ _, relays ] of Object.entries(seenOn)) {
			for (const relay of relays ?? []) {
				eventRelayCounts[relay] = (eventRelayCounts[relay] ?? 0) + 1;
			}
		}

		return eventRelayCounts;
	}, [ rows.length, intervalTickCounts ]);

	const didScrollOnceRef = useRef(false);

	useEffect(() => {
		if (didScrollOnceRef.current) {
			return;
		}

		if (!hash) {
			return;
		}

		const element = document.getElementById(hash);

		if (!element) {
			return;
		}

		element.scrollIntoView();

		didScrollOnceRef.current = true;
	}, [ hash, rows.length ]);

	const createHandleRelayEnabledChange = (url: string) => {
		url = normalizeUrl(url);

		return (event: ChangeEvent<HTMLInputElement>) => {
			const enabled = event.target.checked;

			setLocalStorageRelays({
				...localStorageRelays,
				[url]: enabled,
			});
		};
	};

	const [ addRelayRelay, setAddRelayRelay ] = useState('');

	const handleAddRelayRelayChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setAddRelayRelay(event.target.value);
	}, []);

	const isAddRelayRelayValid = useMemo(() => {
		try {
			new URL(addRelayRelay);
			return true;
		} catch (error) {
			return false;
		}
	}, [ addRelayRelay ]);

	const handleAddRelaySubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		setLocalStorageRelays({
			...localStorageRelays,
			[addRelayRelay]: true,
		});

		setAddRelayRelay('');
	}, [ addRelayRelay ]);

	const createHandleRelayRemoveClick = (url: string) => {
		url = normalizeUrl(url);

		return () => {
			setLocalStorageRelays(Object.fromEntries(
				Object
					.entries(localStorageRelays ?? {})
					.filter(([ url_ ]) => !urlEquals(url_, url)),
			));
		};
	};

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

			<table className={styles.relays}>
				<tbody>
					{Array.from(relays.entries()).map(([ url, enabled ]) => (
						<tr
							className={styles.relay}
							key={url}
						>
							<td>
								<div
									className={styles.relayEnabled}
								>
									<input
										type="checkbox"
										checked={enabled}
										onChange={createHandleRelayEnabledChange(url)}
									/>
								</div>
							</td>

							<td
								className={styles.relayCount}
							>
								{eventRelayCounts[url] ?? 0}
							</td>

							<td
								className={styles.relayUrl}
							>
								{url}
							</td>

							<td
								className={styles.relayRemove}
							>
								{!defaultRelays.some(url_ => urlEquals(url_, url)) && (
									<button
										className={styles.relayRemoveButton}
										onClick={createHandleRelayRemoveClick(url)}
									>
										Remove
									</button>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<form
				className={styles.addRelays}
				onSubmit={handleAddRelaySubmit}
			>
				<input
					required
					className={styles.addRelaysInput}
					type="text"
					value={addRelayRelay}
					onChange={handleAddRelayRelayChange}
				/>

				<button
					disabled={!isAddRelayRelayValid}
					className={styles.addRelaysButton}
					type="submit"
				>
					Add relay
				</button>
			</form>

			<div className={styles.count}>
				Got {rows.length} {plur('message', rows.length)}
			</div>

			<div className={styles.rows}>
				{rows.map(row => (
					row.type === 'event' ? (
						<div
							className={classNames(
								styles.row,
								hash === row.event.id && styles.rowHighlighted,
								styles.eventRow,
							)}
							id={row.event.id}
							key={row.event.id}
							onClick={createHandleEventClick(row.event)}
						>
							<div className={styles.eventRowPretty}>
								{prettyEventString(row.event)}
							</div>
							<div className={styles.eventRowEvent}>
								{stringifyEvent(row.event)}
							</div>
							{hash === row.event.id && (
								<div className={styles.eventRowRelays}>
									<div>
										Seen on relays:
									</div>
									{simplePool.seenOn(row.event.id).map(relay => (
										<div
											className={styles.eventRowRelay}
											key={relay}
										>
											{relay}
										</div>
									))}
								</div>
							)}
						</div>
					) : (
						<div
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
