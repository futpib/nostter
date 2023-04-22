import { Injectable } from '@nestjs/common';
import { EventService, NostrEvent } from '@/event/event.service';
import { RelayPoolService } from '@/relay-pool/relay-pool.service';

@Injectable()
export class EventDatabaseCacheService {
	constructor(
		private readonly _eventService: EventService,
		private readonly _relayPoolService: RelayPoolService,
	) {}

	async getById(id: string): Promise<NostrEvent | null> {
		const eventFromDb = await this._eventService.getById(id);

		if (eventFromDb && !EventService.isEventPointer(eventFromDb)) {
			return EventService.databaseEventToNostrEvent(eventFromDb);
		}

		const eventFromRelayPool = await this._relayPoolService.getById(id);

		if (eventFromRelayPool) {
			await this._eventService.addNostrEvent(eventFromRelayPool);
		}

		return eventFromRelayPool;
	}
}
