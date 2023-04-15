import { EventRecord, localRelayDexie } from "@/dexie/localRelay";
import invariant from "invariant";
import { Event, Filter } from "nostr-tools";

export class LocalPool {
	async get(_relays: string[], filter: Filter): Promise<Event | null> {
		const equalityCriterias: Record<keyof EventRecord, undefined | string | string[] | number | number[]> = ({} as any);

		for (const [ key, value ] of Object.entries(filter)) {
			if (key === "ids") {
				equalityCriterias.id = value;
				continue;
			}

			if (key === "kinds") {
				equalityCriterias.kind = value;
				continue;
			}

			if (key === 'authors') {
				equalityCriterias.pubkey = value;
				continue;
			}

			invariant(false, `FIXME: Unsupported filter key: ${key}`);
		}

		const result = await localRelayDexie.events.where(equalityCriterias).first();

		return result ?? null;
	}
}
