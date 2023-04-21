import { CacheTTL, Injectable } from '@nestjs/common';
import { Duration } from 'luxon';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RelayService {
	constructor(
		private _prisma: PrismaService,
	) {}

	async getConnectionRelays() {
		return await this._prisma.relay.findMany();
	}

	@CacheTTL(Duration.fromObject({ minutes: 1 }).as('milliseconds'))
	async getConnectionRelayUrls() {
		const relays = await this.getConnectionRelays();
		return relays.map((relay) => relay.url).sort();
	}

	async addRelayUrls(urls: string[]) {
		await this._prisma.$transaction(urls.map(url => (
			this._prisma.relay.upsert({
				where: { url },
				update: {},
				create: { url },
			})
		)));
	}
}
