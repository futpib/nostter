import { Injectable } from '@nestjs/common';
import { Helpers } from 'graphile-worker';
import invariant from 'invariant';
import { Task, TaskHandler } from 'nestjs-graphile-worker';
import { Kind } from 'nostr-tools';
import { EventDeletionRelationStateService } from 'src/event-deletion-relation-state/event-deletion-relation-state.service';
import { EventService } from 'src/event/event.service';
import { StateHeightHelpers } from 'src/state-height-helpers';

export type UpdateEventDeletionStateTaskPayload = {
	targetHeightString: string;
};

@Injectable()
@Task('UpdateEventDeletionState')
export class UpdateEventDeletionStateTask {
	constructor(
		private _eventService: EventService,
		private _eventDeletionRelationStateService: EventDeletionRelationStateService,
	) {}

	@TaskHandler()
	async handler(payload: UpdateEventDeletionStateTaskPayload, _helpers: Helpers) {
		const height = await this._eventDeletionRelationStateService.getHeight();
		const targetHeight = BigInt(payload.targetHeightString);

		const {
			reached: reachedHeight,
			range: heightRange,
		} = StateHeightHelpers.getTaskEventHeightRange({
			current: height,
			target: targetHeight,
		});

		const events = await this._eventService.getManyByHeightRange(heightRange, {
			where: {
				kind: BigInt(Kind.EventDeletion),
			},
		});

		for (const event of events) {
			invariant(false, 'TODO');
		}
	}
}
