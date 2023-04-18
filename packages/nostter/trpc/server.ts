import { initTRPC } from '@trpc/server';
import { TRPCContext } from './context';
import { transformer } from './transformers';
import { TRPCMeta } from './meta';

export const trpcServer = initTRPC
	.context<TRPCContext>()
	.meta<TRPCMeta>()
	.create({
		transformer,
		allowOutsideOfServer: true,
	});
