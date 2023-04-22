import { AbstractStateService } from '@/abstract-state-service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventDeletionRelationStateService extends AbstractStateService {
	constructor(
		private _prisma: PrismaService,
	) {
		super();
	}

	protected get _statePrismaDelegate() {
		return this._prisma.eventDeletionRelationState;
	}
}
