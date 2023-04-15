import { TRPCRouter } from '@/trpc/router';
import { TRPCLink } from '@trpc/client';
import { TRPCContext } from "@/trpc/context";
import { trpcRouter } from "@/trpc/router";
import { observable } from '@trpc/server/observable';
import invariant from 'invariant';
import { defaultRelays } from '@/constants/defaultRelays';
import { LocalPool } from '@/nostr/LocalPool';

const localRelayPool = new LocalPool();

const createLocalTRPCContext = (): TRPCContext => ({
	defaultRelays: defaultRelays,
	relayPool: localRelayPool as any,
});

const localTRPCCaller = trpcRouter.createCaller(createLocalTRPCContext());

export const localLink = (): TRPCLink<TRPCRouter> => {
	return (runtime) => {
		return (props) => {
			if (props.op.type === 'query') {
				return observable((observer) => {
					let handler: any = localTRPCCaller;

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
