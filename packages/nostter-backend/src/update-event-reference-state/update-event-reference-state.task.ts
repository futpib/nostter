import { Injectable, Logger } from '@nestjs/common';
import { Helpers } from 'graphile-worker';
import { Task, TaskHandler } from 'nestjs-graphile-worker';
import { EventReferenceRelationStateService } from '@/event-reference-relation-state/event-reference-relation-state.service';
import { EventService, ValidatedDatabaseEvent } from '@/event/event.service';
import { RelayService } from '@/relay/relay.service';
import { BigIntMath } from '@/big-int-math/big-int-math';
import { EventResolveEventPointersStateService } from '@/event-resolve-event-pointers-state/event-resolve-event-pointers-state.service';

export type UpdateEventReferenceStateTaskPayload = {};

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
	private _logger = new Logger(UpdateEventReferenceStateTask.name);

	constructor(
		private _eventService: EventService,
		private _relayService: RelayService,
		private _eventReferenceRelationStateService: EventReferenceRelationStateService,
		private _eventResolveEventPointersStateService: EventResolveEventPointersStateService,
	) {}

	private async _getStartInclusive(): Promise<bigint> {
		return this._eventReferenceRelationStateService.getHeight();
	}

	private async _getEndInclusive(): Promise<bigint> {
		return this._eventResolveEventPointersStateService.getHeight();
	}

	private async _getHeightRange(): Promise<[bigint, bigint]> {
		const start = await this._getStartInclusive();
		const end = await this._getEndInclusive();

		return [
			start,
			BigIntMath.max(start, BigIntMath.min(end, start + 64n)),
		];
	}

	@TaskHandler()
	async handler(_payload: UpdateEventReferenceStateTaskPayload, _helpers: Helpers) {
		const heightRange = await this._getHeightRange();

		this._logger.log(`Updating event reference state in range [${heightRange[0]}, ${heightRange[1]}]`);

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

		await this._eventReferenceRelationStateService.setHeight(heightRange[1]);
	}
}
