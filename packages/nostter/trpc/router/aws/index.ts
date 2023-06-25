import { z } from 'zod';
import { trpcServer } from "@/trpc/server";
import { combineMetaMiddleware } from '@/trpc/middlewares';
import { Duration } from 'luxon';

export const trpcAwsRouter = trpcServer.router({
	metadata: trpcServer.procedure
		.use(combineMetaMiddleware({
			meta: {
				cacheControl: {
					public: true,
					immutable: true,
					maxAge: Duration.fromObject({ minutes: 5 }),
				},
			},
		}))
		.input(z.object({
			url: z.string().url(),
		}))
		.query(async ({ input: { url } }) => {
			return {
				TODO: true,
			};
		}),
});
