import { Injectable, Logger } from '@nestjs/common';
import invariant from 'invariant';
import { Task, TaskHandler } from 'nestjs-graphile-worker';
import { Kind } from 'nostr-tools';
import { EventDeletionRelationStateService } from '@/event-deletion-relation-state/event-deletion-relation-state.service';
import { EventService, ValidatedDatabaseEvent } from '@/event/event.service';
import { EventReferenceRelationStateService } from '@/event-reference-relation-state/event-reference-relation-state.service';
import { BigIntMath } from '@/big-int-math/big-int-math';
import { Helpers } from 'graphile-worker';
import { EventReferenceRelation } from '@prisma/client';

export type UpdateEventDeletionStateTaskPayload = {};

@Injectable()
@Task('UpdateEventDeletionState')
export class UpdateEventDeletionStateTask {
	private _logger = new Logger(UpdateEventDeletionStateTask.name);

	constructor(
		private _eventService: EventService,
		private _eventDeletionRelationStateService: EventDeletionRelationStateService,
		private _eventReferenceRelationStateService: EventReferenceRelationStateService,
	) {}

	private async _getStartExclusive(): Promise<bigint> {
		return this._eventDeletionRelationStateService.getHeight();
	}

	private async _getEndInclusive(): Promise<bigint> {
		return this._eventReferenceRelationStateService.getHeight();
	}

	private async _getHeightRange(): Promise<[bigint, bigint]> {
		const start = await this._getStartExclusive();
		const end = await this._getEndInclusive();

		return [
			start,
			BigIntMath.max(start, BigIntMath.min(end, start + 1024n)),
		];
	}

	async canProgress(): Promise<boolean> {
		const [ startExclusive, endInclusive ] = await this._getHeightRange();

		return startExclusive < endInclusive;
	}

	@TaskHandler()
	async handler(_payload: UpdateEventDeletionStateTaskPayload, _helpers: Helpers) {
		const heightRange = await this._getHeightRange();

		this._logger.log(`Updating event deletion state in range [${heightRange[0]}, ${heightRange[1]}]`);

		const events = await this._eventService.getManyReferencesByHeightRange(heightRange, {
			where: {
				kind: BigInt(Kind.EventDeletion),
			},
		});

		const deleterToDeletee = new Map<string, { deleteeEventId: string; deleterEventPubkey: string; invalid?: boolean; }[]>();
		const deleteeEventIds = new Set<string>();

		for (const event of events) {
			invariant(Number(event.kind) === Kind.EventDeletion, 'Expected event deletion');

			for (const referenceRelation of event.referenceRelations_referrer) {
				const deleterEventId = referenceRelation.referrerEventId;
				const deleteeEventId = referenceRelation.refereeEventId;

				if (!deleterToDeletee.has(deleterEventId)) {
					deleterToDeletee.set(deleterEventId, []);
				}

				deleterToDeletee.get(deleterEventId)!.push({
					deleteeEventId,
					deleterEventPubkey: event.pubkey,
				});

				deleteeEventIds.add(deleteeEventId);
			}
		}

		const deleteeEvents = await this._eventService.getManyByIds([...deleteeEventIds]);
		const deleteeEventIdToEvent = new Map<string, ValidatedDatabaseEvent>(deleteeEvents.map(event => [ event.id, event ]));

		for (const deletees of deleterToDeletee.values()) {
			for (const deletee of deletees) {
				const deleteeEvent = deleteeEventIdToEvent.get(deletee.deleteeEventId);

				invariant(deleteeEvent, 'Expected deletee event');

				if (deleteeEvent.pubkey !== deletee.deleterEventPubkey) {
					deletee.invalid = true;
				}
			}
		}

		const deletionRelations = (
			[...deleterToDeletee.entries()]
				.flatMap(([ deleterEventId, deletees ]) => deletees.flatMap(deletee => {
					if (deletee.invalid) {
						return [];
					}

					return [
						{
							deleterEventId,
							deleteeEventId: deletee.deleteeEventId,
						},
					];
				}))
		);

		await this._eventService.addDeletionRelations(deletionRelations);
		await this._eventService.addFirstDeletionRelations(deletionRelations);

		await this._eventDeletionRelationStateService.setHeight(heightRange[1]);
	}
}
