import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { TaskSpec as BaseTaskSpec, WorkerEventMap } from 'graphile-worker';
import { GraphileWorkerListener, OnWorkerEvent, WorkerService } from 'nestjs-graphile-worker';
import { Kind } from 'nostr-tools';
import { DatabaseEvent } from '@/event/event.service';
import { GetReferrerEventsTaskPayload } from '@/get-referrer-events/get-referrer-events.task';
import { UpdateEventDeletionStateTaskPayload } from '@/update-event-deletion-state/update-event-deletion-state.task';
import { UpdateEventReferenceStateTaskPayload } from '@/update-event-reference-state/update-event-reference-state.task';
import { ResolveEventPointersTaskPayload } from '@/resolve-event-pointers/resolve-event-pointers.task';
import { Interval } from '@nestjs/schedule';
import { UpdateEventReactionStateTaskPayload } from '@/update-event-reaction-state/update-event-reaction-state.task';
import { UpdateEventReactionCountStateTaskPayload } from '@/update-event-reaction-count-state/update-event-reaction-count-state.task';

type Tasks = {
	GetReferrerEvents: {
		payload: GetReferrerEventsTaskPayload;
	};

	ResolveEventPointers: {
		payload: ResolveEventPointersTaskPayload;
	};

	UpdateEventReferenceState: {
		payload: UpdateEventReferenceStateTaskPayload;
	};

	UpdateEventDeletionState: {
		payload: UpdateEventDeletionStateTaskPayload;
	};

	UpdateEventReactionState: {
		payload: UpdateEventReactionStateTaskPayload;
	};

	UpdateEventReactionCountState: {
		payload: UpdateEventReactionCountStateTaskPayload;
	};
};

enum TaskPriority {
	High = 512,
	Default = 1024,
	Low = 2048,
}

interface TaskSpec extends BaseTaskSpec {
	jobKey: string;
	priority: TaskPriority;
}

@Injectable()
@GraphileWorkerListener()
export class TaskSchedulerService implements OnApplicationBootstrap {
	constructor(
		private readonly _workerService: WorkerService,
	) {}

	private async _addJob<I extends keyof Tasks>(identifier: I, payload: Tasks[I]['payload'], taskSpec: TaskSpec) {
		return this._workerService.addJob(identifier, payload, {
			...taskSpec,
			priority: Math.floor(taskSpec.priority * Math.random()),
		});
	}

	public async handleEventUpsert(event: DatabaseEvent) {
		await this._addJob('UpdateEventReferenceState', {}, {
			jobKey: 'UpdateEventReferenceState',
			priority: TaskPriority.Default,
		});

		await this._addJob('GetReferrerEvents', {
			refereeEventId: event.id,
		}, {
			jobKey: [
				'GetReferrerEvents',
				event.id,
			].join(':'),
			priority: (
				Number(event.kind) === Kind.Reaction
					? TaskPriority.High
					: TaskPriority.Default
			),
		});
	}

	public async handleEventPointersUpsert(targetHeight: bigint) {
		await this._addJob('ResolveEventPointers', {}, {
			jobKey: 'ResolveEventPointers',
			priority: TaskPriority.Default,
		});
	}

	public async handleEventReactionsRequest(eventId: string) {
		await this._addJob('UpdateEventReactionCountState', {
			eventId,
		}, {
			jobKey: [
				'UpdateEventReactionCountState',
				eventId,
			].join(':'),
			priority: TaskPriority.Default,
		});
	}

	@Interval(1000)
	private async handleInterval() {
		await this._addJob('UpdateEventReferenceState', {}, {
			jobKey: 'UpdateEventReferenceState',
			priority: TaskPriority.Default,
		});

		await this._addJob('UpdateEventDeletionState', {}, {
			jobKey: 'UpdateEventDeletionState',
			priority: TaskPriority.Default,
		});

		await this._addJob('UpdateEventReactionState', {}, {
			jobKey: 'UpdateEventReactionState',
			priority: TaskPriority.Default,
		});
	}

	@OnWorkerEvent('job:success')
	private async onJobSuccess({ job }: WorkerEventMap['job:success']) {
		if (job.task_identifier === 'UpdateEventReferenceState') {
			await this._addJob('UpdateEventDeletionState', {}, {
				jobKey: 'UpdateEventDeletionState',
				priority: TaskPriority.Default,
			});
		}
	}

	async onApplicationBootstrap() {
		this._workerService.run();
	}
}
