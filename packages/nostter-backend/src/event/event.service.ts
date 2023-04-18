import { Injectable } from '@nestjs/common';
import { Event as DatabaseEvent } from '@prisma/client';
import invariant from 'invariant';
import { DateTime } from 'luxon';
import { Event as NostrEvent } from 'nostr-tools';
import { PrismaService } from 'src/prisma/prisma.service';

export interface ValidatedDatabaseEvent extends DatabaseEvent {
	tags: string[][];
}

export type {
	DatabaseEvent,
	NostrEvent,
};

@Injectable()
export class EventService {
	constructor(
		private _prisma: PrismaService,
	) {}

	static nostrEventToDatabaseEvent(event: NostrEvent): ValidatedDatabaseEvent {
		const databaseEvent: ValidatedDatabaseEvent & { created_at?: number } = {
			...event,
			createdAt: DateTime.fromSeconds(event.created_at).toJSDate(),
		};

		delete databaseEvent.created_at;

		return databaseEvent;
	}

	static databaseEventToNostrEvent(databaseEvent: DatabaseEvent): NostrEvent {
		const validatedDatabaseEvent = EventService.validateDatabaseEvent(databaseEvent);

		const nostrEvent: NostrEvent & { createdAt?: Date } = {
			...validatedDatabaseEvent,
			created_at: DateTime.fromJSDate(validatedDatabaseEvent.createdAt).toSeconds(),
		};

		delete nostrEvent.createdAt;

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

	async getById(id: string): Promise<ValidatedDatabaseEvent | null> {
		const databaseEvent = await this._prisma.event.findUnique({
			where: {
				id,
			},
		});

		return databaseEvent ? EventService.validateDatabaseEvent(databaseEvent) : null;
	}

	async addNostrEvent(nostrEvent: NostrEvent) {
		const databaseEvent = EventService.nostrEventToDatabaseEvent(nostrEvent);

		await this._prisma.event.upsert({
			where: { id: databaseEvent.id },
			update: {},
			create: databaseEvent,
		});
	}
}
