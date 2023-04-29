import { TRPCRouter } from '@/trpc/router';
import { debugExtend } from '@/utils/debugExtend';
import { OperationResultEnvelope, TRPCLink } from '@trpc/client';
import invariant from 'invariant';
import * as Rx from 'rxjs';
import * as Rxo from 'rxjs/operators';

const log = debugExtend('clients', 'trpc', 'links', 'forkJoinLink');

export const forkJoinLink = ({
	joinWith,
	childLinks,
}: {
	joinWith: (resultEnvelopes: OperationResultEnvelope<unknown>[]) => OperationResultEnvelope<unknown>;
	childLinks: Record<string, TRPCLink<TRPCRouter>>;
}): TRPCLink<TRPCRouter> => {
	return (runtime) => {
		const childOperationLinks = Object.entries(childLinks).map(([ key, link ]) => [ key, link(runtime) ] as const);

		return (props) => {
			if (props.op.type === 'query') {
				const opLog = log.extend(props.op.path).extend(String(props.op.id));

				return Rx.forkJoin(childOperationLinks.map(([ key, childOperationLink ]) => {
					const childOperation = childOperationLink(props);

					return new Rx.Observable<OperationResultEnvelope<unknown>>(observer => {
						opLog('starting child operation %s', key);
						return childOperation.subscribe({
							next: (resultEnvelope) => {
								opLog('child operation %s nexted', key);
								observer.next(resultEnvelope);
							},
							complete: () => {
								opLog('child operation %s completed', key);
								observer.complete();
							},
							error: (error) => {
								opLog('child operation %s errored', key);
								observer.error(error);
							},
						});
					});
				})).pipe(
					Rxo.map(joinWith),
				);
			}

			invariant(false, 'forkJoinLink does not support opeartion type %s', props.op.type);
		};
	};
};
