import { Injectable } from '@nestjs/common';
import { Helpers } from 'graphile-worker';
import { Task, TaskHandler } from 'nestjs-graphile-worker';
import { EventDatabaseCacheService } from 'src/event-database-cache/event-database-cache.service';
import { EventResolveEventPointersStateService } from 'src/event-resolve-event-pointers-state/event-resolve-event-pointers-state.service';
import { DATABASE_EVENT_KIND_EVENT_POINTER, EventService } from 'src/event/event.service';
import { StateHeightHelpers } from 'src/state-height-helpers';

export type ResolveEventPointersTaskPayload = {
	targetHeightString: string;
};

@Injectable()
@Task('ResolveEventPointers')
export class ResolveEventPointersTask {
	constructor(
		private _eventService: EventService,
		private _eventDatabaseCacheService: EventDatabaseCacheService,
		private _eventResolveEventPointersStateService: EventResolveEventPointersStateService,
	) {}

	@TaskHandler()
	async handler(payload: ResolveEventPointersTaskPayload, _helpers: Helpers) {
		const height = await this._eventResolveEventPointersStateService.getHeight();
		const targetHeight = BigInt(payload.targetHeightString);

		const {
			reached: reachedHeight,
			range: heightRange,
		} = StateHeightHelpers.getTaskEventHeightRange({
			current: height,
			target: targetHeight,
		});

		const eventPointers = await this._eventService.getManyByHeightRange(heightRange, {
			where: {
				kind: DATABASE_EVENT_KIND_EVENT_POINTER,
			},
		});

		for (const eventPointer of eventPointers) {
			await this._eventDatabaseCacheService.getById(eventPointer.id);
		}

		await this._eventResolveEventPointersStateService.setHeight(reachedHeight);
	}
}
