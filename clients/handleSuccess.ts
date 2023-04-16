import { EventRecord, TagRecord, getLocalRelayDexie } from "@/dexie/localRelay";
import { EventSet } from "@/nostr/EventSet";

const existingEventIds = new Set<string>();

export async function handleSuccess(eventSet: EventSet) {
	const tagRecords = new Map<string, TagRecord>();
	const eventRecords = new Map<string, EventRecord>();

	for (const event of eventSet) {
		if (existingEventIds.has(event.id)) {
			continue;
		}

		const eventRecord = event as EventRecord;
		eventRecord.tagIds = [];

		eventRecord.aTag1s = [];
		eventRecord.dTag1s = [];
		eventRecord.eTag1s = [];
		eventRecord.gTag1s = [];
		eventRecord.iTag1s = [];
		eventRecord.pTag1s = [];
		eventRecord.rTag1s = [];
		eventRecord.tTag1s = [];

		for (const tag of event.tags) {
			const tag0 = tag[0];
			const tag1 = tag[1];

			const tagRecord: TagRecord = {
				id: JSON.stringify(tag),

				_0: tag0,
				_1: tag1,
				_2: tag[2],
				_3: tag[3],

				values: tag,
			};

			eventRecord.tagIds.push(tagRecord.id);

			const key = tag0 + "Tag1s";
			if (key in eventRecord) {
				(eventRecord as any)[key].push(tag1);
			}

			tagRecords.set(tagRecord.id, tagRecord);
		}

		eventRecords.set(eventRecord.id, eventRecord);
		existingEventIds.add(eventRecord.id);
	}

	const localRelayDexie = await getLocalRelayDexie();

	return Promise.all([
		localRelayDexie.tags.bulkPut([...tagRecords.values()]),
		localRelayDexie.events.bulkPut([...eventRecords.values()]),
	]);
}
