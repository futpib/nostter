import { TRPCRouter } from '@/trpc/router';
import { TRPCLink } from '@trpc/client';
import { TRPCContext } from "@/trpc/context";
import { trpcRouter } from "@/trpc/router";
import { defaultRelays } from '@/constants/defaultRelays';
import { LocalPool } from '@/nostr/LocalPool';
import { callerLink } from './caller';

const localRelayPool = new LocalPool();

const createLocalTRPCContext = (): TRPCContext => ({
	defaultRelays: defaultRelays,
	combinedRelays: defaultRelays,
	relayPool: localRelayPool as any,
});

const localTRPCCaller = trpcRouter.createCaller(createLocalTRPCContext());

export const localLink = (): TRPCLink<TRPCRouter> => callerLink({
	caller: localTRPCCaller,
});
