import { TRPCRouter } from '@/trpc/router';
import { TRPCLink } from '@trpc/client';
import { trpcRouter } from "@/trpc/router";
import { observable } from '@trpc/server/observable';
import invariant from 'invariant';
import { ObservableLike, Unsubscribable } from 'type-fest';

type TRPCCaller = ReturnType<typeof trpcRouter.createCaller>;

export const callerLink = ({
	caller,
	onSubscriptionData,
}: {
	caller: TRPCCaller
	onSubscriptionData?: (data: unknown) => void;
}): TRPCLink<TRPCRouter> => {
	return (runtime) => {
		return (props) => {
			if (props.op.type === 'query') {
				return observable((observer) => {
					let handler: any = caller;

					for (const segment of props.op.path.split('.')) {
						handler = handler[segment];
					}

					const promise: Promise<unknown> = handler(props.op.input);

					promise.then((data: unknown) => {
						observer.next({
							result: {
								type: 'data',
								data,
							},
						});
						observer.complete();
					}).catch((error: unknown) => {
						observer.error(error as any);
					});
				});
			}

			if (props.op.type === 'subscription') {
				return observable((observer) => {
					let handler: any = caller;

					for (const segment of props.op.path.split('.')) {
						handler = handler[segment];
					}

					const observablePromise: Promise<ObservableLike<unknown>> = handler(props.op.input);

					let cancelled = false;
					let unsubscribable: Unsubscribable | undefined;

					observablePromise.then(observable => {
						if (cancelled) {
							return;
						}

						unsubscribable = observable.subscribe({
							next(data: unknown) {
								onSubscriptionData?.(data);
								observer.next({
									result: {
										type: 'data',
										data,
									},
								});
							},

							error(error: unknown) {
								observer.error(error as any);
							},

							complete() {
								observer.complete();
							},
						});
					}).catch((error: unknown) => {
						observer.error(error as any);
					});

					return () => {
						cancelled = true;
						unsubscribable?.unsubscribe();
					};
				});
			}

			invariant(false, 'not implemented');
		};
	};
};
