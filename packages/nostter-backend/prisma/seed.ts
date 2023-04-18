import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const seedRelays = [
	"wss://nostr.bitcoiner.social",
	"wss://relay.nostr.bg",
	"wss://relay.snort.social",
	"wss://relay.damus.io",
	"wss://nostr.oxtr.dev",
	"wss://nostr-pub.wellorder.net",
	"wss://nostr.mom",
	"wss://no.str.cr",
	"wss://nos.lol",

	"wss://relay.nostr.com.au",
	"wss://eden.nostr.land",
	"wss://nostr.milou.lol",
	"wss://puravida.nostr.land",
	"wss://nostr.wine",
	"wss://nostr.inosta.cc",
	"wss://atlas.nostr.land",
	"wss://relay.orangepill.dev",
	"wss://relay.nostrati.com",

	"wss://relay.nostr.band",
];

async function main() {
	for (const relay of seedRelays) {
		await prisma.relay.upsert({
			where: { url: relay },
			update: {},
			create: { url: relay },
		});
	}
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	});
