import { TRPCRouter } from '@/trpc/router';
import { TRPCLink } from '@trpc/client';
import { defaultRelays } from "@/constants/defaultRelays";
import { TRPCContext } from "@/trpc/context";
import { trpcRouter } from "@/trpc/router";
import { simplePool } from "@/utils/simplePool";
import { observable } from '@trpc/server/observable';
import invariant from 'invariant';

const createRelaysTRPCContext = (): TRPCContext => ({
	defaultRelays,
	relayPool: simplePool,
});

const relaysTRPCCaller = trpcRouter.createCaller(createRelaysTRPCContext());

export const relaysLink = (): TRPCLink<TRPCRouter> => {
	return (runtime) => {
		return (props) => {
			if (props.op.type === 'query') {
				return observable((observer) => {
					let handler: any = relaysTRPCCaller;

					for (const segment of props.op.path.split('.')) {
						handler = handler[segment];
					}

					const promise = handler(props.op.input);

					promise.then((data: unknown) => {
						observer.next({
							result: { data },
						});
						observer.complete();
					}).catch((error: unknown) => {
						observer.error(error as any);
					});
				});
			}

			invariant(false, 'not implemented');
		};
	};
};
