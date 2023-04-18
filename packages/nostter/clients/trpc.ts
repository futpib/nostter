import { createTRPCReact } from '@trpc/react-query';
import { TRPCRouter } from "@/trpc/router";
import { transformer } from '@/trpc/transformers';
import { backendLink } from './trpc/links/backend';
import { raceLink } from './trpc/links/race';
import { relaysLink } from './trpc/links/relays';
import { localLink } from './trpc/links/local';

export const trpcReact = createTRPCReact<TRPCRouter>({
	abortOnUnmount: true,
});

export const trpcClient = trpcReact.createClient({
	links: [
		raceLink({
			childLinks: [
				backendLink,
				relaysLink(),
				localLink(),
			],
		}),
	],

	transformer,
});
