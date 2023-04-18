import { TRPCRouter } from '@/trpc/router';
import { TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';

export const ignoreSubscriptionsLink = ({
	childLink,
}: {
	childLink: TRPCLink<TRPCRouter>;
}): TRPCLink<TRPCRouter> => {
	return (runtime) => {
		const childOperationLink = childLink(runtime);

		return (props) => {
			if (props.op.type === 'subscription') {
				return observable((observer) => {
					observer.complete();
				});
			}

			return childOperationLink(props);
		};
	};
};
