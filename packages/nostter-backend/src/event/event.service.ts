import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Event as DatabaseEvent } from '@prisma/client';
import invariant from 'invariant';
import { DateTime } from 'luxon';
import { Event as NostrEvent } from 'nostr-tools';
import { PrismaService } from '@/prisma/prisma.service';
import { TaskSchedulerService } from '@/task-scheduler/task-scheduler.service';

export const DATABASE_EVENT_KIND_EVENT_POINTER = -0xDEADBEEFn as const;

export interface ValidatedDatabaseEvent extends DatabaseEvent {
	tags: string[][];
}

export type {
	DatabaseEvent,
	NostrEvent,
};

type GetManyByHeightRangeOptions = {
	where?: {
		kind?: bigint | {
			in?: bigint[];
		};
	};
	include?: {
		refereeEvents?: boolean;
		referrerEvents?: boolean;
	};
}

@Injectable()
export class EventService implements OnApplicationBootstrap {
	constructor(
		private _prisma: PrismaService,
		private _taskSchedulerService: TaskSchedulerService
	) {}

	static nostrEventToDatabaseEvent(event: NostrEvent): Omit<ValidatedDatabaseEvent, 'height'> {
		const databaseEvent: Omit<ValidatedDatabaseEvent, 'height'> & { created_at?: number } = {
			id: event.id,
			sig: event.sig,
			pubkey: event.pubkey,
			tags: event.tags,
			content: event.content,
			kind: BigInt(event.kind),
			createdAt: DateTime.fromSeconds(event.created_at).toJSDate(),

			firstDeleterEventId: null,
		};

		delete databaseEvent.created_at;

		return databaseEvent;
	}

	static isEventPointer(event: DatabaseEvent): boolean {
		return event.kind === DATABASE_EVENT_KIND_EVENT_POINTER;
	}

	static databaseEventToNostrEvent(databaseEvent: DatabaseEvent): NostrEvent {
		const validatedDatabaseEvent = EventService.validateDatabaseEvent(databaseEvent);

		const bigIntKind = validatedDatabaseEvent.kind;

		invariant(
			bigIntKind > Number.MIN_SAFE_INTEGER
				&& bigIntKind < Number.MAX_SAFE_INTEGER,
			'Event kind must be a safe integer, got %s',
			bigIntKind,
		);

		invariant(
			!EventService.isEventPointer(validatedDatabaseEvent),
			'Event pointer cannot be converted to Nostr event',
		);

		const kind = Number(bigIntKind);

		const nostrEvent: NostrEvent = {
			id: validatedDatabaseEvent.id,
			sig: validatedDatabaseEvent.sig,
			pubkey: validatedDatabaseEvent.pubkey,
			tags: validatedDatabaseEvent.tags,
			content: validatedDatabaseEvent.content,
			kind,
			created_at: DateTime.fromJSDate(validatedDatabaseEvent.createdAt).toSeconds(),
		};

		return nostrEvent;
	}

	static validateDatabaseEvent(event: DatabaseEvent): ValidatedDatabaseEvent {
		const { tags } = event;
		invariant(
			(
				Array.isArray(tags)
					&& tags.every((tag) => (
						Array.isArray(tag)
							&& tag.every((tagPart) => typeof tagPart === 'string')
					))
			),
			'Event tags must be an array, got %s',
			typeof tags,
		);

		return event as ValidatedDatabaseEvent;
	}

	static createEventPointer(id: string): Omit<ValidatedDatabaseEvent, 'height'> {
		return {
			kind: DATABASE_EVENT_KIND_EVENT_POINTER,
			id,
			sig: '',
			pubkey: '',
			tags: [],
			content: '',
			createdAt: new Date(0),

			firstDeleterEventId: null,
		};
	}

	async getById(id: string): Promise<ValidatedDatabaseEvent | null> {
		const databaseEvent = await this._prisma.event.findUnique({
			where: {
				id,
			},
		});

		return databaseEvent ? EventService.validateDatabaseEvent(databaseEvent) : null;
	}

	async getMaxHeightEvent(): Promise<ValidatedDatabaseEvent | null> {
		const maxEvent = await this._prisma.event.findFirst({
			orderBy: {
				height: 'desc',
			},
		});

		return maxEvent ? EventService.validateDatabaseEvent(maxEvent) : null;
	}

	async getMaxHeight(): Promise<bigint> {
		const maxEvent = await this.getMaxHeightEvent();

		return maxEvent?.height ?? -1n;
	}

	async getManyByIds(ids: string[]): Promise<ValidatedDatabaseEvent[]> {
		const databaseEvents = await this._prisma.event.findMany({
			where: {
				id: {
					in: ids,
				},
			},
		});

		return databaseEvents.map(EventService.validateDatabaseEvent);
	}

	async getManyByHeightRange([ startInclusive, endInclusive ]: [ bigint, bigint ], {
		where: optionsWhere = {},
		include,
	}: GetManyByHeightRangeOptions = {}): Promise<ValidatedDatabaseEvent[]> {
		const where = {
			...optionsWhere,
			height: {
				gte: startInclusive,
				lte: endInclusive,
			},
		};

		const databaseEvents = await this._prisma.event.findMany({
			where,
			include,
			orderBy: {
				height: 'asc',
			},
		});

		return databaseEvents.map(EventService.validateDatabaseEvent);
	}

	async addNostrEvent(nostrEvent: NostrEvent) {
		const databaseEvent = EventService.nostrEventToDatabaseEvent(nostrEvent);

		const update: Omit<ValidatedDatabaseEvent, 'kind' | 'id' | 'height' | 'firstDeleterEventId'> = {
			sig: databaseEvent.sig,
			pubkey: databaseEvent.pubkey,
			tags: databaseEvent.tags,
			content: databaseEvent.content,
			createdAt: databaseEvent.createdAt,
		};

		const event = await this._prisma.event.upsert({
			where: { id: databaseEvent.id },
			update,
			create: databaseEvent,
		});

		if (event.kind === DATABASE_EVENT_KIND_EVENT_POINTER) {
			await this._prisma.$queryRaw`
				UPDATE "Event"
				SET
					kind = ${databaseEvent.kind}
					, height = nextval(format('%I', 'Event_height_seq'))
				WHERE
					id = ${event.id}
			`;
		}

		await this._taskSchedulerService.handleEventUpsert(event);
	}

	async addNostrEvents(nostrEvents: NostrEvent[]) {
		for (const nostrEvent of nostrEvents) {
			await this.addNostrEvent(nostrEvent);
		}
	}

	async addEventPointers(eventPointers: Omit<ValidatedDatabaseEvent, 'height'>[]) {
		await this._prisma.$transaction(eventPointers.map((eventPointer) => (
			this._prisma.event.upsert({
				where: { id: eventPointer.id },
				update: {},
				create: eventPointer,
			})
		)));

		const targetHeight = await this.getMaxHeight();

		await this._taskSchedulerService.handleEventPointersUpsert(targetHeight);
	}

	async addReferenceRelations(referenceRelations: {
		referrerEventId: string;
		refereeEventId: string;
		recommendedRelayUrl: undefined | string;
	}[]) {
		await this._prisma.$transaction(referenceRelations.map((referenceRelation) => (
			this._prisma.eventReferenceRelation.upsert({
				where: {
					referrerEventId_refereeEventId: {
						referrerEventId: referenceRelation.referrerEventId,
						refereeEventId: referenceRelation.refereeEventId,
					},
				},
				update: {
					recommendedRelayUrl: referenceRelation.recommendedRelayUrl,
				},
				create: referenceRelation,
			})
		)), {
			isolationLevel: 'RepeatableRead',
		});
	}

	async addDeletionRelations(deletionRelations: {
		deleterEventId: string;
		deleteeEventId: string;
	}[]) {
		await this._prisma.$transaction(deletionRelations.map((deletionRelation) => (
			this._prisma.eventDeletionRelation.upsert({
				where: {
					deleterEventId_deleteeEventId: {
						deleterEventId: deletionRelation.deleterEventId,
						deleteeEventId: deletionRelation.deleteeEventId,
					},
				},
				update: {},
				create: deletionRelation,
			})
		)));
	}

	async addFirstDeletionRelations(firstDeletionRelations: {
		deleterEventId: string;
		deleteeEventId: string;
	}[]) {
		await this._prisma.$transaction(firstDeletionRelations.map((firstDeletionRelation) => (
			this._prisma.event.updateMany({
				where: {
					id: firstDeletionRelation.deleteeEventId,
					firstDeleterEventId: null,
				},
				data: {
					firstDeleterEventId: firstDeletionRelation.deleterEventId,
				},
			})
		)));
	}

	async addReactionRelations(reactionRelations: {
		reacterEventId: string;
		reacteeEventId: string;
	}[]) {
		await this._prisma.$transaction(reactionRelations.map((reactionRelation) => (
			this._prisma.eventReactionRelation.upsert({
				where: {
					reacterEventId_reacteeEventId: {
						reacterEventId: reactionRelation.reacterEventId,
						reacteeEventId: reactionRelation.reacteeEventId,
					},
				},
				update: {},
				create: reactionRelation,
			})
		)));
	}

	async onApplicationBootstrap() {
		const maxEvent = await this.getMaxHeightEvent();

		if (maxEvent) {
			await this._taskSchedulerService.handleEventUpsert(maxEvent);
		}
	}
}
