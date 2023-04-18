import { CacheTTL, Injectable } from '@nestjs/common';
import invariant from 'invariant';
import { Duration } from 'luxon';
import { Filter, SimplePool } from 'nostr-tools';
import { RelayService } from 'src/relay/relay.service';

@Injectable()
export class RelayPoolService {
	private readonly _simplePool = new SimplePool();

	constructor(
		private readonly _relayService: RelayService,
	) {
		invariant(typeof WebSocket !== 'undefined', 'WebSocket is not defined');
	}

	@CacheTTL(Duration.fromObject({ seconds: 10 }).as('milliseconds'))
	public async get(filter: Filter) {
		const relays = await this._relayService.getConnectionRelayUrls();

		return this._simplePool.get(
			relays,
			filter,
		);
	}

	public async getById(id: string) {
		const event = await this.get({
			ids: [ id ],
		});

		return event;
	}
}
