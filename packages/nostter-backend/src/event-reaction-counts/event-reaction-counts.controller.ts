import { Controller, Get, Param } from '@nestjs/common';
import { EventReactionCountStateService } from '@/event-reaction-count-state/event-reaction-count-state.service';

@Controller('events/:eventId/reactionCounts')
export class EventReactionCountsController {
	constructor(
		private _eventReactionCountStateService: EventReactionCountStateService,
	) {}

	@Get()
	async getReactions(@Param('eventId') eventId: string) {
		const eventReactionState = await this._eventReactionCountStateService.getByEventId(eventId);

		const reactionCounts = eventReactionState?.reactionCounts ?? {};

		return { reactionCounts };
	}
}
