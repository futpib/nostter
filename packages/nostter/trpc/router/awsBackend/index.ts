import { z } from 'zod';
import { trpcServer } from "@/trpc/server";
import { combineMetaMiddleware } from '@/trpc/middlewares';
import { Duration } from 'luxon';
import { Event } from 'nostr-tools';
import { EventSet } from '@/nostr/EventSet';
import { getContactsEventPublicKeys } from '@/utils/getContactsEventPublicKeys';

const {
	AWS_BACKEND_URL,
} = process.env;

type PubkeyPreloadedData = {
	user_pubkey: string;
	notes: PubkeyPreloadedNotes;
	additional_kinds: PubkeyPreloadedAdditionalKinds;
}

type PubkeyPreloadedNotes = Record<string, Event>;

type PubkeyPreloadedAdditionalKinds = Record<'0' | '3', Event>;

async function fetchPublicKeyPreloadedData(pubkey: string) {
	const response = await fetch(AWS_BACKEND_URL + '/default/?user_pubkey=' + pubkey, {
		headers: {
			'accept': 'application/json',
		},
	});

	if (!response.ok) {
		return undefined;
	}

	const data = await response.json();

	return data as PubkeyPreloadedData;
}

function addPublicKeyPreloadedDataToEventSet(eventSet: EventSet, data: PubkeyPreloadedData) {
	for (const event of Object.values(data.notes)) {
		eventSet.add(event);
	}

	for (const event of Object.values(data.additional_kinds)) {
		eventSet.add(event);
	}
}

export const trpcAwsBackendRouter = trpcServer.router({
	pubkeyPreloadedEvents: trpcServer.procedure
		.use(combineMetaMiddleware({
			meta: {
				cacheControl: {
					public: true,
					immutable: true,
					maxAge: Duration.fromObject({ minutes: 5 }),
				},
			},
		}))
		.input(z.object({
			pubkey: z.string(),
		}))
		.query(async ({ input: { pubkey } }) => {
			const data = await fetchPublicKeyPreloadedData(pubkey);

			const eventSet = new EventSet();

			if (!data) {
				return eventSet;
			}

			addPublicKeyPreloadedDataToEventSet(eventSet, data);

			const contactsEvent = data.additional_kinds['3'] as undefined | Event;
			const contactsEventPublicKeys = contactsEvent ? getContactsEventPublicKeys(contactsEvent) : [];

			const datas = await Promise.all(contactsEventPublicKeys.slice(0, 8).map(fetchPublicKeyPreloadedData));

			for (const data of datas) {
				if (!data) {
					continue;
				}

				addPublicKeyPreloadedDataToEventSet(eventSet, data);
			}

			return eventSet;
		}),
});
