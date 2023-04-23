import { BigIntMath } from '@/big-int-math/big-int-math';
import { EventReactionCountStateService, ReactionCounts } from '@/event-reaction-count-state/event-reaction-count-state.service';
import { EventReactionRelationStateService } from '@/event-reaction-relation-state/event-reaction-relation-state.service';
import { EventService } from '@/event/event.service';
import { TaskSchedulerService } from '@/task-scheduler/task-scheduler.service';
import { Injectable, Logger } from '@nestjs/common';
import { Task, TaskHandler } from 'nestjs-graphile-worker';

export type UpdateEventReactionCountStateTaskPayload = {
	eventId: string;
};

@Injectable()
@Task('UpdateEventReactionCountState')
export class UpdateEventReactionCountStateTask {
	private _logger = new Logger(UpdateEventReactionCountStateTask.name);

	constructor(
		private _eventService: EventService,
		private _eventReactionCountStateService: EventReactionCountStateService,
		private _eventReactionRelationStateService: EventReactionRelationStateService,
		private _taskSchedulerService: TaskSchedulerService
	) {}

	private async _getStartExclusiveByEventId(eventId: string): Promise<bigint> {
		return this._eventReactionCountStateService.getHeightByEventId(eventId);
	}

	private async _getEndInclusive(): Promise<bigint> {
		return this._eventReactionRelationStateService.getHeight();
	}

	private async _getHeightRangeByEventId(
		eventId: string,
	): Promise<[bigint, bigint]> {
		const start = await this._getStartExclusiveByEventId(eventId);
		const end = await this._getEndInclusive();

		return [
			start,
			BigIntMath.max(start, BigIntMath.min(end, start + 1024n)),
		];
	}

	async canProgressByEventId(eventId: string): Promise<boolean> {
		const [ startExclusive, endInclusive ] = await this._getHeightRangeByEventId(eventId);

		return startExclusive < endInclusive;
	}

	@TaskHandler()
	async handler(payload: UpdateEventReactionCountStateTaskPayload) {
		const { eventId } = payload;
		const heightRange = await this._getHeightRangeByEventId(eventId);

		this._logger.log(`Updating event reaction count state in range [${heightRange[0]}, ${heightRange[1]}]`);

		const reactionCountState = await this._eventReactionCountStateService.getByEventId(eventId);

		const reactionEvents = await this._eventService.getManyReactionsByHeightRange(eventId, heightRange);
		const deletionEvents = await this._eventService.getManyFirstDeletionsByHeightRange(heightRange);

		const reactionCounts = (reactionCountState?.reactionCounts ?? {}) as ReactionCounts;

		reactionCounts.eventCount ??= 0;
		reactionCounts.reactionEventCount ??= 0;
		reactionCounts.deletionEventCount ??= 0;
		reactionCounts.reactions ??= {};

		for (const reactionEvent of reactionEvents) {
			reactionCounts.eventCount += 1;
			reactionCounts.reactionEventCount += 1;

			reactionCounts.reactions[reactionEvent.content] ??= 0;
			reactionCounts.reactions[reactionEvent.content]! += 1;
		}

		for (const deletionEvent of deletionEvents) {
			const deletedReaction = deletionEvent.firstDeleteeEvents.find((firstDeleteeEvent) => (
				firstDeleteeEvent.reactionRelations_reacter.some(reactionRelation => reactionRelation.reacteeEventId === eventId)
			));

			if (!deletedReaction) {
				continue;
			}

			reactionCounts.eventCount += 1;
			reactionCounts.deletionEventCount += 1;

			reactionCounts.reactions[deletedReaction.content] ??= 0;
			reactionCounts.reactions[deletedReaction.content]! -= 1;
		}

		console.log({
			reactionEvents,
			deletionEvents,
			reactionCounts,
		});

		await this._eventReactionCountStateService.setHeightAndReactionCountsByEventId(eventId, heightRange[1], reactionCounts);

		if (await this.canProgressByEventId(eventId)) {
			await this._taskSchedulerService.handleUpdateEventReactionCountStateCanProgress(eventId);
		}
	}
}
