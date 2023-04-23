import WebSocket from 'isomorphic-ws';
import { repl } from '@nestjs/core';

global.WebSocket = WebSocket;

async function bootstrap() {
	const { AppModule } = await import('./app.module');

	await repl(AppModule);
}

bootstrap();
