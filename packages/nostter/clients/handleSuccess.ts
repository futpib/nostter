import { EventRecord, getLocalRelayDexie } from "@/dexie/localRelay";
import { EventSet } from "@/nostr/EventSet";

const existingEventIds = new Set<string>();

export async function handleSuccess(eventSet: EventSet) {
	const eventRecords = new Map<string, EventRecord>();

	for (const event of eventSet) {
		if (existingEventIds.has(event.id)) {
			continue;
		}

		const eventRecord = event as EventRecord;

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

			const key = tag0 + "Tag1s";
			if (key in eventRecord) {
				(eventRecord as any)[key].push(tag1);
			}
		}

		eventRecords.set(eventRecord.id, eventRecord);
		existingEventIds.add(eventRecord.id);
	}

	const localRelayDexie = await getLocalRelayDexie();

	return Promise.all([
		localRelayDexie.events.bulkPut([...eventRecords.values()]),
	]);
}
