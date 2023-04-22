import { BigIntMath } from "@/big-int-math/big-int-math";
import { EventDeletionRelationStateService } from "@/event-deletion-relation-state/event-deletion-relation-state.service";
import { EventReactionRelationStateService } from "@/event-reaction-relation-state/event-reaction-relation-state.service";
import { EventReferenceRelationStateService } from "@/event-reference-relation-state/event-reference-relation-state.service";
import { EventService, ValidatedDatabaseEvent } from "@/event/event.service";
import { Injectable, Logger } from "@nestjs/common";
import { EventReferenceRelation } from "@prisma/client";
import { Helpers } from "graphile-worker";
import { Task, TaskHandler } from "nestjs-graphile-worker";
import { Kind } from "nostr-tools";

export interface UpdateEventReactionStateTaskPayload {}

@Injectable()
@Task('UpdateEventReactionState')
export class UpdateEventReactionStateTask {
	private _logger = new Logger(UpdateEventReactionStateTask.name);

	constructor(
		private _eventService: EventService,
		private _eventReactionRelationStateService: EventReactionRelationStateService,
		private _eventDeletionRelationStateService: EventDeletionRelationStateService,
		private _eventReferenceRelationStateService: EventReferenceRelationStateService,
	) {}

	private async _getStartInclusive(): Promise<bigint> {
		return this._eventReactionRelationStateService.getHeight();
	}

	private async _getEndInclusive(): Promise<bigint> {
		return BigIntMath.min(
			await this._eventDeletionRelationStateService.getHeight(),
			await this._eventReferenceRelationStateService.getHeight(),
		);
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
	async handler(_payload: UpdateEventReactionStateTaskPayload, _helpers: Helpers) {
		const heightRange = await this._getHeightRange();

		this._logger.log(`Updating event reaction state in range [${heightRange[0]}, ${heightRange[1]}]`);

		const events = await this._eventService.getManyByHeightRange(heightRange, {
			where: {
				kind: BigInt(Kind.Reaction),
			},
			include: {
				referrerEvents: true,
			},
		});

		const reacterToReactee = new Map<string, string>();

		for (const event_ of events) {
			const event = event_ as ValidatedDatabaseEvent & {
				referrerEvents: EventReferenceRelation[];
			};

			for (const referenceRelation of event.referrerEvents.slice(0, 1)) {
				const reacterEventId = referenceRelation.referrerEventId;
				const reacteeEventId = referenceRelation.refereeEventId;

				reacterToReactee.set(reacterEventId, reacteeEventId);
			}
		}

		await this._eventService.addReactionRelations(
			[...reacterToReactee.entries()]
				.map(([reacterEventId, reacteeEventId]) => ({
					reacterEventId,
					reacteeEventId,
				})),
		);

		await this._eventReactionRelationStateService.setHeight(heightRange[1]);
	}
}
