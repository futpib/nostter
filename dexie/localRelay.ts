import { debugEnabled } from '@/utils/debugEnabled';
import Dexie, { Table } from 'dexie';

export interface EventRecord {
	id: string;
	sig: string;
	pubkey: string;
	kind: number;
	tags: string[][];
	content: string;
	created_at: number;

	// db-only fields
	tagIds: string[];

	aTag1s: string[];
	dTag1s: string[];
	eTag1s: string[];
	gTag1s: string[];
	iTag1s: string[];
	pTag1s: string[];
	rTag1s: string[];
	tTag1s: string[];
}

export interface TagRecord {
	id: string;

	_0: string;
	_1: string;
	_2: string;
	_3: string;

	values: string[];
}

export class LocalRelayDexie extends Dexie {
	events!: Table<EventRecord>;
	tags!: Table<TagRecord>;

	constructor() {
		super('localRelay');

		this.version(1).stores({
			events: '&id, *tagIds, [id+kind], [pubkey+kind], [tagIds+kind], pubkey, kind, created_at',
			tags: '&id, [_0+_1], _0, _1, _2, _3',
		});

		this.version(2).stores({
			events: [
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
			].join(', '),
			tags: '&id, [_0+_1], _0, _1, _2, _3',
		});
	}
}

export const localRelayDexie = new LocalRelayDexie();

export function getLocalRelayDexie() {
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
