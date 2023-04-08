import { EventRecord, TagRecord, localRelayDexie } from "@/dexie/localRelay";
import { EventSet } from "@/nostr/EventSet";

export async function handleSuccess(eventSet: EventSet) {
	const promises: Promise<unknown>[] = [];

	for (const event of eventSet) {
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

			promises.push(localRelayDexie.tags.put(tagRecord, tagRecord.id));
			tagIds.push(tagRecord.id);
		}

		const eventRecord: EventRecord = {
			...event,
			tagIds,
		};

		promises.push(localRelayDexie.events.put(eventRecord, eventRecord.id));
	}

	return Promise.all(promises);
}
