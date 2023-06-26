
import { localRelayDexiesHandleSuccess } from '@/clients/handleSuccess';
import { LocalRelayDexie } from '@/dexie/localRelay';
import anyTest from 'ava';
import type { TestFn } from 'ava';
import { Event, finishEvent, generatePrivateKey, getPublicKey } from 'nostr-tools';
import { EventSet } from './EventSet';
import { LocalPool } from './LocalPool'
import invariant from 'invariant';

type TestContext = {
	eventSet: EventSet;
	eventsLatestFirst: Event[];
	eventsOldestFirst: Event[];
};

const test = anyTest as TestFn<TestContext>;

const localRelayDexie = new LocalRelayDexie();
const localPool = new LocalPool(localRelayDexie);
const relays: string[] = [];

const MOCK_SCALE_FACTOR = 10;
const MOCK_SCALE_FACTOR_MIDDLE = Math.ceil(MOCK_SCALE_FACTOR / 2);

const privateKeys = Array.from({ length: MOCK_SCALE_FACTOR }, () => generatePrivateKey());
const publicKeys = privateKeys.map(getPublicKey);
const timestamps = Array.from({ length: MOCK_SCALE_FACTOR }, (_, i) => i);
const kinds = Array.from({ length: MOCK_SCALE_FACTOR }, (_, i) => i);

test.before(async t => {
	const eventSet = new EventSet();

	for (const [ i, privateKey ] of privateKeys.entries()) {
		for (const created_at of timestamps) {
			for (const kind of kinds) {
				const event = finishEvent({
					kind,
					created_at,
					tags: (
						i === 1 ? [
							[ 'e', eventSet.getEventsLatestFirst()[0].id ],
						] : [
						]
					),
					content: [
						i,
						kind,
						created_at,
					].join(' '),
				}, privateKey);

				eventSet.add(event);
			}
		}
	}

	await localRelayDexiesHandleSuccess(localRelayDexie, eventSet);

	Object.assign(t.context, {
		eventSet,
		eventsLatestFirst: eventSet.getEventsLatestFirst(),
		eventsOldestFirst: eventSet.getEventsOldestFirst(),
	});
});

test('list events with non-existent author', async t => {
	const result = await localPool.list(relays, [
		{
			authors: [ 'non-existent' ],
		},
	]);

	t.is(result.length, 0);
});

test('list latest event with non-existent author', async t => {
	const result = await localPool.list(relays, [
		{
			authors: [ 'non-existent' ],
			until: MOCK_SCALE_FACTOR_MIDDLE,
			limit: 1,
		},
	]);

	t.is(result.length, 0);

	if (result.length !== 0) {
		console.log('result.length !== 0', { result });
	}
});

test('list latest event until by kind', async t => {
	for (const until of timestamps) {
		if (until === 0) {
			continue;
		}

		const result = await localPool.list(relays, [
			{
				kinds: [ 0 ],
				until,
				limit: 1,
			},
		]);

		const expectedOneOf = (
			t.context.eventsLatestFirst
				.filter(event => event.kind === 0 && event.created_at === until - 1)
		);

		t.true(expectedOneOf.length > 0);
		t.true(result.length > 0);

		const someEventOk = expectedOneOf.some(event => event.id === result[0].id);

		if (!someEventOk) {
			console.log('!someEventOk 1', { result, expectedOneOf });
		}

		t.true(someEventOk);
	}
});

test('list latest event until by kind and author', async t => {
	for (const until of timestamps) {
		if (until === 0) {
			continue;
		}

		const result = await localPool.list(relays, [
			{
				kinds: [ 0 ],
				authors: [ publicKeys[0] ],
				until,
				limit: 1,
			},
		]);

		const expectedOneOf = (
			t.context.eventsLatestFirst
				.filter(event => event.kind === 0 && event.pubkey === publicKeys[0] && event.created_at === until - 1)
		);

		t.true(expectedOneOf.length > 0);
		t.is(result.length, 1);

		const someEventOk = expectedOneOf.some(event => event.id === result[0].id);

		if (!someEventOk) {
			console.log('!someEventOk 2', { result, expectedOneOf });
		}

		t.true(someEventOk);
	}
});

test('list latest event until by kind and e tag', async t => {
	const eventWithETag = t.context.eventsOldestFirst.find(event => event.tags.some(([ key ]) => key === 'e'));

	t.truthy(eventWithETag);

	const eTagEventId = eventWithETag?.tags.find(([ key ]) => key === 'e')?.[1];

	t.truthy(eTagEventId);

	invariant(eTagEventId, 'eTagEventId');

	const result = await localPool.list(relays, [
		{
			'#e': [ eTagEventId ],
			kinds: [ 0 ],
			until: timestamps.at(-1),
			limit: 16,
		},
	]);

	t.true(result.length > 0);
	t.true(result.length <= 16);

	for (const event of result) {
		t.true(event.tags.some(([ key, value ]) => key === 'e' && value === eTagEventId));
		t.true(event.kind === 0);
		t.true(event.created_at < MOCK_SCALE_FACTOR);
	}
});
