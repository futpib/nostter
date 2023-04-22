import { Injectable } from '@nestjs/common';
import { Helpers } from 'graphile-worker';
import { Task, TaskHandler } from 'nestjs-graphile-worker';
import { EventService } from '@/event/event.service';
import { RelayPoolService } from '@/relay-pool/relay-pool.service';

export type GetReferrerEventsTaskPayload = {
	refereeEventId: string;
};

@Injectable()
@Task('GetReferrerEvents')
export class GetReferrerEventsTask {
	constructor(
		private _relayPoolService: RelayPoolService,
		private _eventService: EventService,
	) {}

	@TaskHandler()
	async handler(payload: GetReferrerEventsTaskPayload, _helpers: Helpers) {
		const events = await this._relayPoolService.getReferrerEvents(payload.refereeEventId);

		await this._eventService.addNostrEvents(events);
	}
}
