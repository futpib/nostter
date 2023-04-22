import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { TaskSchedulerService } from '@/task-scheduler/task-scheduler.service';

export type ReactionCounts = {
	eventCount?: number;
	reactionEventCount?: number;
	deletionEventCount?: number;
	reactions?: Record<string, undefined | number>;
}

@Injectable()
export class EventReactionCountStateService {
	constructor(
		private _prisma: PrismaService,
		private _taskSchedulerService: TaskSchedulerService,
	) {}

	async getByEventId(eventId: string) {
		return this._prisma.eventReactionCountState.findUnique({
			where: {
				eventId,
			},
		});
	}

	async getHeightByEventId(eventId: string) {
		const eventReactionCountState = await this.getByEventId(eventId);

		return eventReactionCountState?.height ?? -1n;
	}

	async setHeightAndReactionCountsByEventId(eventId: string, height: bigint, reactionCounts: ReactionCounts) {
		await this._prisma.eventReactionCountState.upsert({
			where: {
				eventId,
			},
			update: {
				height,
				reactionCounts,
			},
			create: {
				height,
				eventId,
				reactionCounts,
			},
		});
	}

	async handleEventReactionsRequest(eventId: string) {
		await this._taskSchedulerService.handleEventReactionsRequest(eventId);
	}
}
