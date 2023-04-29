import { createTRPCReact, splitLink } from '@trpc/react-query';
import { TRPCRouter } from "@/trpc/router";
import { transformer } from '@/trpc/transformers';
import { backendLink } from './trpc/links/backend';
import { raceLink } from './trpc/links/race';
import { relaysLink } from './trpc/links/relays';
import { localLink } from './trpc/links/local';
import { findLink } from './trpc/links/find';
import { isDataEventSetEmpty } from '@/utils/isDataEventSetEmpty';
import invariant from 'invariant';
import { forkJoinLink } from './trpc/links/forkJoin';
import { isEventSetPageResultEnvelope, isEventSetPageResultEnvelopes } from '@/utils/isEventSetPageResultEnvelope';
import { mergeEventSetPageResultEnvelopes } from '@/utils/mergeEventSetPageResultEnvelopes';
import { handleSuccess } from './handleSuccess';
import { switchLink } from './trpc/links/switch';

export const trpcReact = createTRPCReact<TRPCRouter>({
	abortOnUnmount: true,
});

const cacheFirstNonEmptyLink = findLink({
	predicate(resultEnvelope) {
		return !isDataEventSetEmpty((resultEnvelope.result as any).data);
	},

	childLinks: [
		[
			'local',
			localLink(),
		],

		[
			'remote',
			raceLink({
				childLinks: {
					backend: backendLink,
					relays: relaysLink(),
				},
			}),
		],
	],
});

const forkJoinMergePagesLink = forkJoinLink({
	joinWith(resultEnvelopes) {
		if (isEventSetPageResultEnvelopes(resultEnvelopes)) {
			for (const resultEnvelope of resultEnvelopes) {
				invariant(isEventSetPageResultEnvelope(resultEnvelope), 'Unknown result envelope: %s', resultEnvelope);

				if (resultEnvelope.result.type === 'data') {
					handleSuccess(resultEnvelope.result.data.eventSet);
				}
			}

			return mergeEventSetPageResultEnvelopes(resultEnvelopes);
		}

		invariant(false, 'Unknown result envelope: %s', resultEnvelopes);
	},

	childLinks: {
		local: localLink(),
		backend: backendLink,
		relays: relaysLink(),
	},
});

export const trpcClient = trpcReact.createClient({
	links: [
		switchLink({
			condition(op) {
				if (op.type === 'subscription') {
					return 'subscription';
				}

				if (op.path === 'nostr.event') {
					return 'single';
				}

				if (op.path === 'nostr.infiniteEvents') {
					return 'infinite';
				}

				invariant(false, `Unknown path: %s`, op.path);
			},

			cases: {
				single: cacheFirstNonEmptyLink,
				infinite: forkJoinMergePagesLink,
				subscription: relaysLink(),
			},
		}),
	],

	transformer,
});
