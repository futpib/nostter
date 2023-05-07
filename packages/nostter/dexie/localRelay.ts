import { debugEnabled } from '@/utils/debugEnabled';
import { debugExtend } from '@/utils/debugExtend';
import Dexie, { Table } from 'dexie';
import { Duration } from 'luxon';

const log = debugExtend('dexie', 'localRelay');
const collectGarbageLog = log.extend('collectGarbage');

const MAX_EVENTS = 2 ** 14;
const GARBAGE_COLLECTION_STEP = 2 ** 6;

export interface EventRecord {
	id: string;
	sig: string;
	pubkey: string;
	kind: number;
	tags: string[][];
	content: string;
	created_at: number;

	// db-only fields
	aTag1s: string[];
	dTag1s: string[];
	eTag1s: string[];
	gTag1s: string[];
	iTag1s: string[];
	pTag1s: string[];
	rTag1s: string[];
	tTag1s: string[];
}

export class LocalRelayDexie extends Dexie {
	private _garbageCollectionInProgress = false;

	events!: Table<EventRecord>;

	constructor() {
		super('localRelay');

		this.version(1).stores({
			events: '&id, *tagIds, [id+kind], [pubkey+kind], [tagIds+kind], pubkey, kind, created_at',
			tags: '&id, [_0+_1], _0, _1, _2, _3',
		});

		const version2EventsSchema = [
			'&id',
			'[id+kind]',
			'[pubkey+kind]',
			'[tagIds+kind]',
			'[kind+id+pubkey]',
			'pubkey',
			'kind',
			'created_at',

			'*tagIds',

			'*aTag1s',
			'*dTag1s',
			'*eTag1s',
			'*gTag1s',
			'*iTag1s',
			'*pTag1s',
			'*rTag1s',
			'*tTag1s',

			'[kind+eTag1s]',
		].join(', ');

		this.version(2).stores({
			events: version2EventsSchema,
			tags: '&id, [_0+_1], _0, _1, _2, _3',
		});

		this.version(3).stores({
			events: version2EventsSchema,
		});

		this.version(4).stores({
			events: version2EventsSchema,
			tags: null,
		});

		this.version(5).stores({
			events: [
				'&id',
				'[id+kind]',
				'[pubkey+kind]',
				'[kind+id+pubkey]',
				'pubkey',
				'kind',
				'created_at',

				'*aTag1s',
				'*dTag1s',
				'*eTag1s',
				'*gTag1s',
				'*iTag1s',
				'*pTag1s',
				'*rTag1s',
				'*tTag1s',

				'[kind+eTag1s]',
			].join(', '),
		});

		this.version(6).stores({
			events: [
				'&id',
				'[id+kind]',
				'[pubkey+kind]',
				'[kind+id+pubkey]',
				'pubkey',
				'kind',
				'created_at',

				'*aTag1s',
				'*dTag1s',
				'*eTag1s',
				'*gTag1s',
				'*iTag1s',
				'*pTag1s',
				'*rTag1s',
				'*tTag1s',

				'[kind+eTag1s]',
				'[kind+pTag1s]',
				'[kind+tTag1s]',
			].join(', '),
		});
	}

	async collectGarbage({
		idleDeadline,
	}: {
		idleDeadline?: IdleDeadline;
	} = {}) {
		if (this._garbageCollectionInProgress) {
			return;
		}

		this._garbageCollectionInProgress = true;

		try {
			let eventCount = await this.events.count();

			collectGarbageLog('event count: %d / %d', eventCount, MAX_EVENTS);

			while (eventCount >= MAX_EVENTS) {
				const deletedOldest = await this.events
					.orderBy('created_at')
					.limit(GARBAGE_COLLECTION_STEP)
					.delete();

				collectGarbageLog('deleted %d oldest events', deletedOldest);

				eventCount -= deletedOldest;

				const randomHexLetter = Math.random().toString(16)[2];

				const deletedRandom = await this.events
					.where('id')
					.startsWith(randomHexLetter)
					.limit(GARBAGE_COLLECTION_STEP)
					.delete();

				eventCount -= deletedRandom;

				collectGarbageLog('deleted %d random events', deletedRandom);

				if (
					idleDeadline?.didTimeout
						|| (
							idleDeadline
								&& idleDeadline.timeRemaining() <= 0
						)
				) {
					collectGarbageLog('idle deadline exceeded, stopping garbage collection');

					break;
				}

				collectGarbageLog('event count: %d / %d', eventCount, MAX_EVENTS);
			}
		} finally {
			this._garbageCollectionInProgress = false;
		}
	}
}

const localRelayDexie = new LocalRelayDexie();

export async function getLocalRelayDexie() {
	requestIdleCallback((idleDeadline) => {
		localRelayDexie.collectGarbage({ idleDeadline });
	}, {
		timeout: Duration.fromObject({ minutes: 1 }).as('milliseconds'),
	});

	return localRelayDexie;
}

const INDEXED_TAG_KEYS = [
	'a',
	'd',
	'e',
	'g',
	'i',
	'p',
	'r',
	't',
] as const;

export function isIndexedTagKey(key: string): key is typeof INDEXED_TAG_KEYS[number] {
	return INDEXED_TAG_KEYS.includes(key as any);
}

if (debugEnabled('dexie', 'localRelay') && typeof window !== 'undefined') {
	(window as any).localRelayDexie = localRelayDexie;
}
