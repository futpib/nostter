import { CacheTTL, Injectable } from '@nestjs/common';
import { Duration } from 'luxon';
import { EventService, NostrEvent } from 'src/event/event.service';
import { RelayPoolService } from 'src/relay-pool/relay-pool.service';

@Injectable()
export class EventDatabaseCacheService {
	constructor(
		private readonly _eventService: EventService,
		private readonly _relayPoolService: RelayPoolService,
	) {}

	@CacheTTL(Duration.fromObject({ hours: 1 }).as('milliseconds'))
	async getById(id: string): Promise<NostrEvent | null> {
		const eventFromDb = await this._eventService.getById(id);

		if (eventFromDb) {
			return EventService.databaseEventToNostrEvent(eventFromDb);
		}

		const eventFromRelayPool = await this._relayPoolService.getById(id);

		if (eventFromRelayPool) {
			await this._eventService.addNostrEvent(eventFromRelayPool);
		}

		return eventFromRelayPool;
	}
}
