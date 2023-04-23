import { EventDeletionRelationStateService } from '@/event-deletion-relation-state/event-deletion-relation-state.service';
import { EventReactionCountStateService } from '@/event-reaction-count-state/event-reaction-count-state.service';
import { EventReactionRelationStateService } from '@/event-reaction-relation-state/event-reaction-relation-state.service';
import { EventReferenceRelationStateService } from '@/event-reference-relation-state/event-reference-relation-state.service';
import { EventResolveEventPointersStateService } from '@/event-resolve-event-pointers-state/event-resolve-event-pointers-state.service';
import { SuperjsonInterceptor } from '@/superjson/superjson.interceptor';
import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';

@Controller('debug')
@UseInterceptors(SuperjsonInterceptor)
export class DebugController {
	constructor(
		private _eventReactionRelationStateService: EventReactionRelationStateService,
		private _eventReactionCountStateService: EventReactionCountStateService,
		private _eventDeletionRelationStateService: EventDeletionRelationStateService,
		private _eventResolveEventPointersStateService: EventResolveEventPointersStateService,
		private _eventReferenceRelationStateService: EventReferenceRelationStateService,
	) {}

	@Get('state-heights')
	async getStateHeights() {
		return {
			stateHeights: {
				eventReactionRelationState: await this._eventReactionRelationStateService.getHeight(),
				eventDeletionRelationState: await this._eventDeletionRelationStateService.getHeight(),
				eventResolveEventPointersState: await this._eventResolveEventPointersStateService.getHeight(),
				eventReferenceRelationState: await this._eventReferenceRelationStateService.getHeight(),
			},
		};
	}

	@Get('state-heights/:eventId')
	async getStateHeightsForEvent(@Param('eventId') eventId: string) {
		return {
			stateHeights: {
				eventReactionRelationState: await this._eventReactionRelationStateService.getHeight(),
				eventReactionCountState: await this._eventReactionCountStateService.getHeightByEventId(eventId),
				eventDeletionRelationState: await this._eventDeletionRelationStateService.getHeight(),
				eventResolveEventPointersState: await this._eventResolveEventPointersStateService.getHeight(),
				eventReferenceRelationState: await this._eventReferenceRelationStateService.getHeight(),
			},
		};
	}
}
