import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import invariant from 'invariant';
import { z } from 'zod';

const appConfigSchema = z.object({
	PORT: z.preprocess(x => Number.parseInt(String(x)), z.number().int().positive()),
});

@Injectable()
export class AppConfigService {
	constructor(
		private _configService: ConfigService,
	) {}

	static validate(config: Record<string, unknown>): z.infer<typeof appConfigSchema> {
		return appConfigSchema.parse(config);
	}

	get port(): number {
		const port = Number(this._configService.get('PORT'));

		invariant(Number.isSafeInteger(port), 'PORT must be an integer, got %s', port);

		return port;
	}
}
