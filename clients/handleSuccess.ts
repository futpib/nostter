import { EventRecord, TagRecord, localRelayDexie } from "@/dexie/localRelay";
import { EventSet } from "@/nostr/EventSet";

const existingEventIds = new Set<string>();

export async function handleSuccess(eventSet: EventSet) {
	const tagRecords = new Map<string, TagRecord>();
	const eventRecords = new Map<string, EventRecord>();

	for (const event of eventSet) {
		if (existingEventIds.has(event.id)) {
			continue;
		}

		const tagIds: string[] = [];

		for (const tag of event.tags) {
			const tagRecord: TagRecord = {
				id: JSON.stringify(tag),

				_0: tag[0],
				_1: tag[1],
				_2: tag[2],
				_3: tag[3],

				values: tag,
			};

			tagIds.push(tagRecord.id);
			tagRecords.set(tagRecord.id, tagRecord);
		}

		const eventRecord = event as EventRecord;
		eventRecord.tagIds = tagIds;

		eventRecords.set(eventRecord.id, eventRecord);
		existingEventIds.add(eventRecord.id);
	}

	return Promise.all([
		localRelayDexie.tags.bulkPut([...tagRecords.values()]),
		localRelayDexie.events.bulkPut([...eventRecords.values()]),
	]);
}
