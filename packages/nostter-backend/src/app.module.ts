import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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

@Module({
	imports: [
		ConfigModule.forRoot({
			validate(config) {
				return AppConfigService.validate(config);
			},
		}),

		GraphileWorkerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				connectionString: config.get('DATABASE_URL'),
			}),
		}),

		CacheModule.register(),
	],

	controllers: [
		AppController,
		EventsController,
		EventReactionCountsController,
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
		AppConfigService,
		EventDeletionRelationStateService,
		UpdateEventReferenceStateTask,
		EventReferenceRelationStateService,
		ResolveEventPointersTask,
		EventResolveEventPointersStateService,
	],
})
export class AppModule {}
