import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RelayService {
	constructor(
		private _prisma: PrismaService,
	) {}

	async getConnectionRelays() {
		return await this._prisma.relay.findMany();
	}

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
