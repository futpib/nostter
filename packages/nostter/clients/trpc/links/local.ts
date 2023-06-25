import { TRPCRouter } from '@/trpc/router';
import { TRPCLink } from '@trpc/client';
import { TRPCContext } from "@/trpc/context";
import { defaultRelays } from '@/constants/defaultRelays';
import { LocalPool } from '@/nostr/LocalPool';
import { callerLink } from './caller';
import { trpcUniversalRouter } from '@/trpc/router/universal';

const localRelayPool = new LocalPool();

const createLocalTRPCContext = (): TRPCContext => ({
	defaultRelays: defaultRelays,
	combinedRelays: defaultRelays,
	relayPool: localRelayPool as any,
	resolvedAuthors: undefined,
});

const localTRPCCaller = trpcUniversalRouter.createCaller(createLocalTRPCContext());

export const localLink = (): TRPCLink<TRPCRouter> => callerLink({
	caller: localTRPCCaller,
});
