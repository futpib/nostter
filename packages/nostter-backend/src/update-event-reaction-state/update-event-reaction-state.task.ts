import { Injectable } from "@nestjs/common";
import { Helpers } from "graphile-worker";
import { Task, TaskHandler } from "nestjs-graphile-worker";

interface UpdateEventReactionStateTaskPayload {
	eventId: string;
}

@Injectable()
@Task('UpdateEventReactionState')
export class UpdateEventReactionStateTask {
	constructor(
	) {}

	@TaskHandler()
	handler(payload: UpdateEventReactionStateTaskPayload, _helpers: Helpers) {

	}
}
