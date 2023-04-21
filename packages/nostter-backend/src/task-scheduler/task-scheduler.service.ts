import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { TaskSpec } from 'graphile-worker';
import { WorkerService } from 'nestjs-graphile-worker';
import { DatabaseEvent } from 'src/event/event.service';
import { UpdateEventDeletionStateTaskPayload } from 'src/update-event-deletion-state/update-event-deletion-state.task';
import { UpdateEventReferenceStateTaskPayload } from 'src/update-event-reference-state/update-event-reference-state.task';

type Tasks = {
	UpdateEventReferenceState: {
		payload: UpdateEventReferenceStateTaskPayload;
	};

	UpdateEventDeletionState: {
		payload: UpdateEventDeletionStateTaskPayload;
	};
};

@Injectable()
export class TaskSchedulerService implements OnApplicationBootstrap {
	constructor(
		private readonly _workerService: WorkerService,
	) {}

	private async _addJob<I extends keyof Tasks>(identifier: I, payload: Tasks[I]['payload'], taskSpec?: TaskSpec) {
		return this._workerService.addJob(identifier, payload, taskSpec);
	}

	public async handleEventUpsert(event: DatabaseEvent) {
		await this._addJob('UpdateEventReferenceState', {
			targetHeightString: String(event.height),
		}, {
			jobKey: 'UpdateEventReferenceState',
		});
	}

	async onApplicationBootstrap() {
		this._workerService.run();
	}
}
