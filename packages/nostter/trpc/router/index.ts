import { trpcServer } from "../server";
import { trpcAwsBackendRouter } from "./awsBackend";
import { trpcNostrRouter } from "./nostr";
import { trpcPageRouter } from "./page";

export const trpcRouter = trpcServer.router({
	page: trpcPageRouter,
	nostr: trpcNostrRouter,
	awsBackend: trpcAwsBackendRouter,
});

export type TRPCRouter = typeof trpcRouter;
