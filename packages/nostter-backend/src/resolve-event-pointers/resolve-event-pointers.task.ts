import { Injectable, Logger } from '@nestjs/common';
import { Helpers } from 'graphile-worker';
import { Task, TaskHandler } from 'nestjs-graphile-worker';
import { EventDatabaseCacheService } from '@/event-database-cache/event-database-cache.service';
import { EventResolveEventPointersStateService } from '@/event-resolve-event-pointers-state/event-resolve-event-pointers-state.service';
import { DATABASE_EVENT_KIND_EVENT_POINTER, EventService } from '@/event/event.service';
import { BigIntMath } from '@/big-int-math/big-int-math';

export type ResolveEventPointersTaskPayload = {};

@Injectable()
@Task('ResolveEventPointers')
export class ResolveEventPointersTask {
	private _logger = new Logger(ResolveEventPointersTask.name);

	constructor(
		private _eventService: EventService,
		private _eventDatabaseCacheService: EventDatabaseCacheService,
		private _eventResolveEventPointersStateService: EventResolveEventPointersStateService,
	) {}

	private async _getStartExclusive(): Promise<bigint> {
		return this._eventResolveEventPointersStateService.getHeight();
	}

	private async _getEndInclusive(): Promise<bigint> {
		return this._eventService.getMaxHeight();
	}

	private async _getHeightRange(): Promise<[bigint, bigint]> {
		const start = await this._getStartExclusive();
		const end = await this._getEndInclusive();

		return [
			start,
			BigIntMath.max(start, BigIntMath.min(end, start + 64n)),
		];
	}

	@TaskHandler()
	async handler(_payload: ResolveEventPointersTaskPayload, _helpers: Helpers) {
		const heightRange = await this._getHeightRange();

		this._logger.log(`Resolving event pointers in range [${heightRange[0]}, ${heightRange[1]})`);

		const eventPointers = await this._eventService.getManyByHeightRange(heightRange, {
			where: {
				kind: DATABASE_EVENT_KIND_EVENT_POINTER,
			},
		});

		for (const eventPointer of eventPointers) {
			await this._eventDatabaseCacheService.getById(eventPointer.id);
		}

		await this._eventResolveEventPointersStateService.setHeight(heightRange[1]);
	}
}
