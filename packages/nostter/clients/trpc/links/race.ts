import { TRPCRouter } from '@/trpc/router';
import { debugExtend } from '@/utils/debugExtend';
import { isDataEventSetEmpty } from '@/utils/isDataEventSetEmpty';
import { OperationLink, TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import invariant from 'invariant';
import { Unsubscribable } from 'type-fest';

type ChildOperationState =
	| { state: 'pending' }
	| { state: 'fulfilled'; value: unknown }
	| { state: 'rejected'; error: unknown }
;

const log = debugExtend('clients', 'trpc', 'links', 'raceLink');

export const raceLink = ({
	childLinks,
}: {
	childLinks: Record<string, TRPCLink<TRPCRouter>>;
}): TRPCLink<TRPCRouter> => {
	return (runtime) => {
		const childOperationLinks = Object.entries(childLinks).map(([ key, link ]): [ string, OperationLink<TRPCRouter> ] => [ key, link(runtime) ]);

		return (props) => {
			if (props.op.type === 'query') {
				const opLog = log.extend(props.op.path).extend(String(props.op.id));

				return observable((observer) => {
					const unsubscribables: Unsubscribable[] = [];

					const childOperationStates: Record<string, ChildOperationState> = Object.fromEntries(
						childOperationLinks.map(([ key ]) => [ key, { state: 'pending' } ])
					);

					opLog('starting child operations', props.op.input, childOperationStates);

					for (const [key, childOperationLink] of childOperationLinks) {
						const childOperation = childOperationLink(props);

						const unsubscribable = childOperation.subscribe({
							next: (value) => {
								const data: unknown = (value.result as any).data;

								childOperationStates[key] = {
									state: 'fulfilled',
									value: data,
								};

								opLog('child operation', key, 'fulfilled with', data);

								if (!isDataEventSetEmpty(data)) {
									opLog('sending data from child operation', key, 'to parent because it is not empty');
									observer.next(value);
									return;
								}

								const allSettled = Object.values(childOperationStates).every((state) => state.state !== 'pending');

								if (allSettled) {
									opLog('sending data from child operation', key, 'to parent because all operations are settled');
									observer.next(value);
								}
							},
							error: (error) => {
								childOperationStates[key] = {
									state: 'rejected',
									error,
								};

								opLog('child operation', key, 'rejected with', error);

								const allSettled = Object.values(childOperationStates).every((state) => state.state !== 'pending');

								if (allSettled) {
									opLog('sending error from child operation', key, 'to parent because all operations are settled');
									observer.error(error);
								} else {
									console.error(
										'Error in child operation, will be ignored if at least one operation succeeds.\n',
										error,
									);
								}
							},
							complete: () => {
								opLog('child operation', key, 'completed');

								const allSettled = Object.values(childOperationStates).every((state) => state.state !== 'pending');

								if (allSettled) {
									opLog('sending complete from child operation', key, 'to parent because all operations are settled');
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

					const childOperationFinished: Record<string, boolean> = Object.fromEntries(
						childOperationLinks.map(([ key ]): [ string, boolean ] => [ key, false ])
					);
					let firstError: unknown | undefined;

					for (const [key, childOperationLink] of childOperationLinks) {
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
								childOperationFinished[key] = true;
								firstError ??= error;

								const allFinished = Object.values(childOperationFinished).every((finished) => finished);

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
								childOperationFinished[key] = true;

								const allFinished = Object.values(childOperationFinished).every((finished) => finished);

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

			invariant(false, 'raceLink does not support opeartion type %s', props.op.type);
		};
	};
};
