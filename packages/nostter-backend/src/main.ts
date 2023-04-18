import WebSocket from 'isomorphic-ws';
import { NestFactory } from '@nestjs/core';

global.WebSocket = WebSocket;

async function bootstrap() {
	const { AppModule } = await import('./app.module');

	const app = await NestFactory.create(AppModule);

	await app.listen(3000);
}
bootstrap();
