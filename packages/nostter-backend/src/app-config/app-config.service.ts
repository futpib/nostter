import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';

function zPreprocessNumber(schema: z.ZodNumber) {
	return z.preprocess(x => Number.parseInt(String(x)), schema);
}

const appConfigStringSchema = z.object({
	PORT: z.string().nonempty(),
	DATABASE_URL: z.string().url(),
	GRAPHILE_WORKER_CONCURRENCY: z.string().nonempty(),
	GRAPHILE_WORKER_POLL_INTERVAL: z.string().nonempty(),
	GRAPHILE_WORKER_MAX_POOL_SIZE: z.string().nonempty(),
});

const appConfigSchema = z.object({
	PORT: zPreprocessNumber(z.number().int().positive()),
	GRAPHILE_WORKER_CONCURRENCY: zPreprocessNumber(z.number().int().positive()),
	GRAPHILE_WORKER_POLL_INTERVAL: zPreprocessNumber(z.number().int().positive()),
	GRAPHILE_WORKER_MAX_POOL_SIZE: zPreprocessNumber(z.number().int().positive()),
});

@Injectable()
export class AppConfigService {
	constructor(
		private _configService: ConfigService,
	) {}

	private static defaultConfig() {
		return {
			PORT: '3003',
			DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/postgres',
			GRAPHILE_WORKER_CONCURRENCY: '128',
			GRAPHILE_WORKER_POLL_INTERVAL: '100',
			GRAPHILE_WORKER_MAX_POOL_SIZE: '1',
		};
	}

	static validate(config: Record<string, unknown>): z.infer<typeof appConfigSchema> {
		return appConfigSchema.parse(appConfigStringSchema.parse({
			...AppConfigService.defaultConfig(),
			config,
		}));
	}

	get port(): number {
		return Number(this._configService.get('PORT'));
	}

	get databaseUrl(): string {
		return this._configService.get('DATABASE_URL')!;
	}

	get graphileWorkerConcurrency(): number {
		return Number(this._configService.get('GRAPHILE_WORKER_CONCURRENCY'));
	}

	get graphileWorkerPollInterval(): number {
		return Number(this._configService.get('GRAPHILE_WORKER_POLL_INTERVAL'));
	}
}
