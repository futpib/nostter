import { Injectable } from '@nestjs/common';
import { AbstractStateService } from '@/abstract-state-service';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class EventResolveEventPointersStateService extends AbstractStateService {
	constructor(
		private _prisma: PrismaService,
	) {
		super();
	}

	protected get _statePrismaDelegate() {
		return this._prisma.eventResolveEventPointersState;
	}
}
