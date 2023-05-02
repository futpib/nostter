import { trpcServer } from "../server";
import { trpcNostrRouter } from "./nostr";
import { trpcPageRouter } from "./page";

export const trpcRouter = trpcServer.router({
	page: trpcPageRouter,
	nostr: trpcNostrRouter,
});

export type TRPCRouter = typeof trpcRouter;
