import { SimplePool } from 'nostr-tools';
import { defaultRelays } from '@/constants/defaultRelays';
import { simplePool } from '@/utils/simplePool';
import { TRPCMeta } from './meta';

export type TRPCContext = {
	defaultRelays: string[];
	relayPool: SimplePool;

	combinedMeta?: TRPCMeta;
};

export async function createTRPCContext(): Promise<TRPCContext> {
	return {
		defaultRelays,
		relayPool: simplePool,
	};
}
