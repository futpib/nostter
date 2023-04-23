import { CacheModule, Module } from '@nestjs/common';
import { GraphileWorkerModule } from 'nestjs-graphile-worker';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { RelayService } from './relay/relay.service';
import { RelayPoolService } from './relay-pool/relay-pool.service';
import { EventService } from './event/event.service';
import { EventDatabaseCacheService } from './event-database-cache/event-database-cache.service';
import { EventsController } from './events/events.controller';
import { UpdateEventDeletionStateTask } from './update-event-deletion-state/update-event-deletion-state.task';
import { TaskSchedulerService } from './task-scheduler/task-scheduler.service';
import { EventReactionCountStateService } from './event-reaction-count-state/event-reaction-count-state.service';
import { EventReactionCountsController } from './event-reaction-counts/event-reaction-counts.controller';
import { AppConfigService } from './app-config/app-config.service';
import { EventDeletionRelationStateService } from './event-deletion-relation-state/event-deletion-relation-state.service';
import { UpdateEventReferenceStateTask } from './update-event-reference-state/update-event-reference-state.task';
import { EventReferenceRelationStateService } from './event-reference-relation-state/event-reference-relation-state.service';
import { ResolveEventPointersTask } from './resolve-event-pointers/resolve-event-pointers.task';
import { EventResolveEventPointersStateService } from './event-resolve-event-pointers-state/event-resolve-event-pointers-state.service';
import { GetReferrerEventsTask } from './get-referrer-events/get-referrer-events.task';
import { AppConfigModule } from './app-config/app-config.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventReactionRelationStateService } from './event-reaction-relation-state/event-reaction-relation-state.service';
import { UpdateEventReactionStateTask } from './update-event-reaction-state/update-event-reaction-state.task';
import { UpdateEventReactionCountStateTask } from './update-event-reaction-count-state/update-event-reaction-count-state.task';
import { DebugController } from './debug/debug.controller';

@Module({
	imports: [
		AppConfigModule,

		GraphileWorkerModule.forRootAsync({
			imports: [AppConfigModule],
			inject: [AppConfigService],
			useFactory: (config: AppConfigService) => ({
				connectionString: config.databaseUrl,
				concurrency: config.graphileWorkerConcurrency,
				pollInterval: config.graphileWorkerPollInterval,
			}),
		}),

		CacheModule.register(),

		ScheduleModule.forRoot(),
	],

	controllers: [
		AppController,
		EventsController,
		EventReactionCountsController,
		DebugController,
	],

	providers: [
		AppService,
		PrismaService,
		RelayService,
		RelayPoolService,
		EventService,
		EventDatabaseCacheService,
		UpdateEventDeletionStateTask,
		TaskSchedulerService,
		EventReactionCountStateService,
		EventDeletionRelationStateService,
		UpdateEventReferenceStateTask,
		EventReferenceRelationStateService,
		ResolveEventPointersTask,
		EventResolveEventPointersStateService,
		GetReferrerEventsTask,
		EventReactionRelationStateService,
		UpdateEventReactionStateTask,
		UpdateEventReactionCountStateTask,
	],
})
export class AppModule {}
