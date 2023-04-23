import { Controller, Get, Param } from '@nestjs/common';
import { EventDatabaseCacheService } from '@/event-database-cache/event-database-cache.service';
import { NostrEvent } from '@/event/event.service';
import { TaskSchedulerService } from '@/task-scheduler/task-scheduler.service';

@Controller('events')
export class EventsController {
	constructor(
		private readonly _eventDatabaseCacheService: EventDatabaseCacheService,
		private readonly _taskSchedulerService: TaskSchedulerService,
	) {}

	@Get(':id')
	async findOne(@Param('id') id: string): Promise<{ event: NostrEvent | null }> {
		await this._taskSchedulerService.handleEventRequest(id);

		const event = await this._eventDatabaseCacheService.getById(id);

		return { event };
	}
}
