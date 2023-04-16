import { EventSet } from '@/nostr/EventSet';
import { TRPCRouter } from '@/trpc/router';
import { TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import invariant from 'invariant';
import { Unsubscribable } from 'type-fest';

type ChildOperationState =
	| { state: 'pending' }
	| { state: 'fulfilled'; value: EventSet }
	| { state: 'rejected'; error: unknown }
;

export const raceLink = ({
	childLinks,
}: {
	childLinks: TRPCLink<TRPCRouter>[];
}): TRPCLink<TRPCRouter> => {
	return (runtime) => {
		const childOperationLinks = childLinks.map((link) => link(runtime));

		return (props) => {
			if (props.op.type === 'query') {
				return observable((observer) => {
					const unsubscribables: Unsubscribable[] = [];

					const childOperationStates = childOperationLinks.map((): ChildOperationState => ({
						state: 'pending',
					}));

					for (const [index, childOperationLink] of childOperationLinks.entries()) {
						const childOperation = childOperationLink(props);

						const unsubscribable = childOperation.subscribe({
							next: (value) => {
								const data: unknown = (value.result as any).data;
								invariant(data instanceof EventSet, 'data is not an EventSet');

								childOperationStates[index] = {
									state: 'fulfilled',
									value: data,
								};

								if (data.size > 0) {
									observer.next(value);
								}

								const allSettled = childOperationStates.every((state) => state.state !== 'pending');

								if (allSettled) {
									observer.next(value);
								}
							},
							error: (error) => {
								childOperationStates[index] = {
									state: 'rejected',
									error,
								};

								const allSettled = childOperationStates.every((state) => state.state !== 'pending');

								if (allSettled) {
									observer.error(error);
								}
							},
							complete: () => {
								const allSettled = childOperationStates.every((state) => state.state !== 'pending');

								if (allSettled) {
									observer.complete();
								}
							},
						});

						unsubscribables.push(unsubscribable);
					}

					return () => {
						for (const unsubscribable of unsubscribables) {
							unsubscribable.unsubscribe();
						}
					}
				});
			}

			if (props.op.type === 'subscription') {
				return observable((observer) => {
					const unsubscribables: Unsubscribable[] = [];

					const seenEventIds = new Set<string>();

					const childOperationFinished = childOperationLinks.map((): boolean => false);
					let firstError: unknown | undefined;

					for (const [index, childOperationLink] of childOperationLinks.entries()) {
						const childOperation = childOperationLink(props);

						const unsubscribable = childOperation.subscribe({
							next: (value) => {
								const data: unknown = (value.result as any).data;

								invariant(
									typeof data === 'object'
										&& data
										&& 'id' in data
										&& typeof data.id === 'string',
									'data does not have a string id',
								);

								if (seenEventIds.has(data.id)) {
									return;
								}

								seenEventIds.add(data.id);
								observer.next(value);
							},
							error: (error) => {
								childOperationFinished[index] = true;
								firstError ??= error;

								const allFinished = childOperationFinished.every((finished) => finished);

								if (allFinished) {
									observer.error(firstError as any);
								} else {
									console.error(
										'Error in child operation, will be ignored if other operations are infinite.\n',
										error,
									);
								}
							},
							complete: () => {
								childOperationFinished[index] = true;

								const allFinished = childOperationFinished.every((finished) => finished);

								if (allFinished) {
									if (firstError) {
										observer.error(firstError as any);
									}

									observer.complete();
								}
							},
						});

						unsubscribables.push(unsubscribable);
					}

					return () => {
						for (const unsubscribable of unsubscribables) {
							unsubscribable.unsubscribe();
						}
					};
				});
			}

			invariant(false, 'raceLink only supports queries');
		};
	};
};
