import { TRPCRouter } from '@/trpc/router';
import { TRPCLink } from '@trpc/client';
import { defaultRelays } from "@/constants/defaultRelays";
import { TRPCContext } from "@/trpc/context";
import { simplePool } from "@/utils/simplePool";
import { callerLink } from './caller';
import { handleTRPCSubscriptionData } from '@/clients/handleTRPCSuccess';
import { Event } from 'nostr-tools';
import invariant from 'invariant';
import { trpcUniversalRouter } from '@/trpc/router/universal';

const createRelaysTRPCContext = (): TRPCContext => ({
	defaultRelays,
	combinedRelays: defaultRelays,
	relayPool: simplePool,
});

const relaysTRPCCaller = trpcUniversalRouter.createCaller(createRelaysTRPCContext());

export const relaysLink = (): TRPCLink<TRPCRouter> => callerLink({
	caller: relaysTRPCCaller,

	onSubscriptionData(data: unknown) {
		invariant(
			typeof data === 'object'
				&& data
				&& 'id' in data
				&& typeof data.id === 'string',
			'data does not have a string id',
		);

		handleTRPCSubscriptionData(data as Event);
	}
});
