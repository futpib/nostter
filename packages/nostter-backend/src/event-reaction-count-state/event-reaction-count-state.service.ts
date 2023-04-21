import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventReactionCountStateService {
	constructor(
		private _prisma: PrismaService,
	) {}

	async getByEventId(eventId: string) {
		return this._prisma.eventReactionCountState.findUnique({
			where: {
				eventId,
			},
		});
	}
}
