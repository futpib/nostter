import { Injectable } from '@nestjs/common';
import invariant from 'invariant';
import { Filter, Kind, SimplePool } from 'nostr-tools';
import { RelayService } from '@/relay/relay.service';

@Injectable()
export class RelayPoolService {
	private readonly _simplePool = new SimplePool();

	constructor(
		private readonly _relayService: RelayService,
	) {
		invariant(typeof WebSocket !== 'undefined', 'WebSocket is not defined');
	}

	public async get(filter: Filter) {
		const relays = await this._relayService.getConnectionRelayUrls();

		invariant(relays.length > 0, 'No relays available');

		return this._simplePool.get(
			relays,
			filter,
		);
	}

	public async list(filters: Filter[]) {
		const relays = await this._relayService.getConnectionRelayUrls();

		invariant(relays.length > 0, 'No relays available');

		return this._simplePool.list(
			relays,
			filters,
		);
	}

	public async getById(id: string) {
		const event = await this.get({
			ids: [ id ],
		});

		return event;
	}

	public async getReferrerEvents(refereeId: string) {
		const kinds = [
			Kind.Text,
			Kind.EventDeletion,
			Kind.Reaction,
		];

		const events = await this.list([
			{
				kinds,
				'#e': [ refereeId ],
			},
		]);

		return events.filter(event => (
			kinds.includes(event.kind)
				&& event.tags.some(([ tagKind, tagValue ]) => (
					tagKind === 'e'
						&& tagValue === refereeId
				))
		));
	}
}
