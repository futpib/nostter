import { TRPCRouter } from '@/trpc/router';
import { debugExtend } from '@/utils/debugExtend';
import { OperationResultEnvelope, TRPCLink } from '@trpc/client';
import invariant from 'invariant';
import * as Rx from 'rxjs';
import * as Rxo from 'rxjs/operators';

const log = debugExtend('clients', 'trpc', 'links', 'findLink');

export const findLink = ({
	predicate,
	childLinks,
}: {
	predicate: (resultEnvelope: OperationResultEnvelope<unknown>) => boolean;
	childLinks: [ string, TRPCLink<TRPCRouter> ][];
}): TRPCLink<TRPCRouter> => {
	return (runtime) => {
		const childOperationLinks = childLinks.map(([ key, link ]) => [ key, link(runtime) ] as const);

		return (props) => {
			if (props.op.type === 'query') {
				const opLog = log.extend(props.op.path).extend(String(props.op.id));

				let lastResult: OperationResultEnvelope<unknown> | undefined;

				return Rx.from(childOperationLinks)
					.pipe(
						Rxo.mergeMap(([ key, childOperationLink ]) => {
							const childOperation = childOperationLink(props);

							return new Rx.Observable<OperationResultEnvelope<unknown>>(observer => {
								opLog('starting child operation %s', key);
								return childOperation.subscribe(observer);
							});
						}),
						Rxo.tap(resultEnvelope => {
							lastResult = resultEnvelope;
						}),
						Rxo.find(predicate),
						Rxo.map(x => {
							if (x !== undefined) {
								return x;
							}

							invariant(lastResult, 'lastResult is undefined');

							return lastResult;
						}),
					)
			}

			invariant(false, 'findLink does not support opeartion type %s', props.op.type);
		};
	};
};
