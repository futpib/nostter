import { Injectable } from '@nestjs/common';
import { Helpers } from 'graphile-worker';
import { Task, TaskHandler } from 'nestjs-graphile-worker';
import { EventReferenceRelationStateService } from 'src/event-reference-relation-state/event-reference-relation-state.service';
import { EventService, ValidatedDatabaseEvent } from 'src/event/event.service';
import { RelayService } from 'src/relay/relay.service';
import { StateHeightHelpers } from 'src/state-height-helpers';

export type UpdateEventReferenceStateTaskPayload = {
	targetHeightString: string;
};

function isValidRelayURL(x: unknown): x is string {
	try {
		const url = new URL(typeof x === 'string' ? x : '');
		return url.protocol === 'wss:';
	} catch (_) {
		return false;
	}
}

@Injectable()
@Task('UpdateEventReferenceState')
export class UpdateEventReferenceStateTask {
	constructor(
		private _eventService: EventService,
		private _relayService: RelayService,
		private _eventReferenceRelationStateService: EventReferenceRelationStateService,
	) {}

	@TaskHandler()
	async handler(payload: UpdateEventReferenceStateTaskPayload, _helpers: Helpers) {
		const height = await this._eventReferenceRelationStateService.getHeight();
		const targetHeight = BigInt(payload.targetHeightString);

		const {
			reached: reachedHeight,
			range: heightRange,
		} = StateHeightHelpers.getTaskEventHeightRange({
			current: height,
			target: targetHeight,
		});

		const events = await this._eventService.getManyByHeightRange(heightRange);

		const eventPointers = new Map<string, Omit<ValidatedDatabaseEvent, 'height'>>();
		const relayUrls = new Set<string>();
		const referrerToReferees = new Map<string, { id: string; recommendedRelayUrl?: string }[]>();

		for (const event of events) {
			for (const tag of event.tags) {
				const [ tagKind, tagValue, tagExtra ] = tag as unknown[];

				if (tagKind !== 'e') {
					continue;
				}

				if (typeof tagValue !== 'string') {
					continue;
				}

				const id = tagValue;
				const recommendedRelayUrl = isValidRelayURL(tagExtra) ? tagExtra : undefined;

				if (recommendedRelayUrl) {
					relayUrls.add(recommendedRelayUrl);
				}

				const eventPointer = EventService.createEventPointer(id);

				eventPointers.set(eventPointer.id, eventPointer);

				if (!referrerToReferees.has(event.id)) {
					referrerToReferees.set(event.id, []);
				}

				referrerToReferees.get(event.id)!.push({ id, recommendedRelayUrl });
			}
		}

		await this._eventService.addEventPointers([...eventPointers.values()]);
		await this._relayService.addRelayUrls([...relayUrls.values()]);
		await this._eventService.addReferenceRelations(
			[...referrerToReferees.entries()]
				.flatMap(([ referrer, referees ]) => referees.map(referee => ({
					referrerEventId: referrer,
					refereeEventId: referee.id,
					recommendedRelayUrl: referee.recommendedRelayUrl,
				})))
		);

		await this._eventReferenceRelationStateService.setHeight(reachedHeight);
	}
}
