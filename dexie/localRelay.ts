import { debugEnabled } from '@/utils/debugEnabled';
import Dexie, { Table } from 'dexie';

export interface EventRecord {
	id: string;
	sig: string;
	pubkey: string;
	kind: number;
	tags: string[][];
	tagIds: string[];
	content: string;
	created_at: number;
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
	}
}

export const localRelayDexie = new LocalRelayDexie();

if (debugEnabled('dexie', 'localRelay') && typeof window !== 'undefined') {
	(window as any).localRelayDexie = localRelayDexie;
}
