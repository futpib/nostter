import { Controller, Get, Param } from '@nestjs/common';
import { EventDatabaseCacheService } from 'src/event-database-cache/event-database-cache.service';
import { NostrEvent } from 'src/event/event.service';

@Controller('events')
export class EventsController {
	constructor(
		private readonly _eventDatabaseCacheService: EventDatabaseCacheService,
	) {}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<{ event: NostrEvent | null }> {
		const event = await this._eventDatabaseCacheService.getById(id);

		return { event };
	}
}
