import WebSocket from 'isomorphic-ws';
import { SimplePool } from 'nostr-tools';

global.WebSocket = WebSocket as any;

export const simplePool = new SimplePool({
	eoseSubTimeout: 1000,
	getTimeout: 1000,
});
