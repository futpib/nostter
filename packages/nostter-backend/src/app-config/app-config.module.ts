import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppConfigService } from './app-config.service';

@Module({
	imports: [
		ConfigModule.forRoot({
			validate(config) {
				return AppConfigService.validate(config);
			},
		}),
	],

	providers: [
		ConfigService,
		AppConfigService,
	],

	exports: [
		AppConfigService,
	],
})
export class AppConfigModule {}
