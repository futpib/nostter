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

@Module({
	imports: [
		ConfigModule.forRoot(),

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
	],

	providers: [
		AppService,
		PrismaService,
		RelayService,
		RelayPoolService,
		EventService,
		EventDatabaseCacheService,
	],
})
export class AppModule {}
