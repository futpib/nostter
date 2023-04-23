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
	flags: string[];
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
			flags: [
				'EventUpsert',
			],
			jobKey: 'UpdateEventReferenceState',
			priority: TaskPriority.Default,
		});

		await this._addJob('GetReferrerEvents', {
			refereeEventId: event.id,
		}, {
			flags: [
				'EventUpsert',
			],
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
			flags: [
				'EventPointersUpsert',
			],
			jobKey: 'ResolveEventPointers',
			priority: TaskPriority.Default,
		});
	}

	public async handleEventRequest(eventId: string) {
		await this._addJob('GetReferrerEvents', {
			refereeEventId: eventId,
		}, {
			flags: [
				'EventRequest',
			],
			jobKey: [
				'GetReferrerEvents',
				eventId,
			].join(':'),
			priority: TaskPriority.Low,
		});
	}

	public async handleEventReactionsRequest(eventId: string) {
		await this._addJob('UpdateEventReactionCountState', {
			eventId,
		}, {
			flags: [
				'EventReactionsRequest',
			],
			jobKey: [
				'UpdateEventReactionCountState',
				eventId,
			].join(':'),
			priority: TaskPriority.Default,
		});
	}

	public async handleUpdateEventReactionCountStateCanProgress(eventId: string) {
		await this._addJob('UpdateEventReactionCountState', {
			eventId,
		}, {
			flags: [
				'UpdateEventReactionCountStateCanProgress',
			],
			jobKey: [
				'UpdateEventReactionCountState',
				eventId,
			].join(':'),
			priority: TaskPriority.Low,
		});
	}

	@Interval(1000)
	private async handleInterval() {
		await this._addJob('UpdateEventReferenceState', {}, {
			flags: [
				'Interval',
			],
			jobKey: 'UpdateEventReferenceState',
			priority: TaskPriority.Low,
		});

		await this._addJob('UpdateEventDeletionState', {}, {
			flags: [
				'Interval',
			],
			jobKey: 'UpdateEventDeletionState',
			priority: TaskPriority.Low,
		});

		await this._addJob('UpdateEventReactionState', {}, {
			flags: [
				'Interval',
			],
			jobKey: 'UpdateEventReactionState',
			priority: TaskPriority.Low,
		});
	}

	private async _handleUpdateEventReferenceStateJobSuccess() {
		await this._addJob('UpdateEventDeletionState', {}, {
			flags: [
				'UpdateEventReferenceStateJobSuccess',
			],
			jobKey: 'UpdateEventDeletionState',
			priority: TaskPriority.Default,
		});
	}

	@OnWorkerEvent('job:success')
	private async _handleJobSuccess({ job }: WorkerEventMap['job:success']) {
		if (job.task_identifier === 'UpdateEventReferenceState') {
			this._handleUpdateEventReferenceStateJobSuccess();
		}
	}

	async onApplicationBootstrap() {
		this._workerService.run();
	}
}
