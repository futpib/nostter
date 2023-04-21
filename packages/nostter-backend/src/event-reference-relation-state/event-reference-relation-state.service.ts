import { Injectable } from '@nestjs/common';
import { AbstractStateService } from 'src/abstract-state-service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventReferenceRelationStateService extends AbstractStateService {
	constructor(
		private _prisma: PrismaService,
	) {
		super();
	}

	protected get _statePrismaDelegate() {
		return this._prisma.eventReferenceRelationState;
	}
}
