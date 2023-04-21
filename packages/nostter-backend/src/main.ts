import WebSocket from 'isomorphic-ws';
import { NestFactory } from '@nestjs/core';
import { AppConfigService } from './app-config/app-config.service';

global.WebSocket = WebSocket;

async function bootstrap() {
	const { AppModule } = await import('./app.module');

	const app = await NestFactory.create(AppModule);

	const config: AppConfigService = app.get(AppConfigService);

	await app.listen(config.port);
}
bootstrap();
