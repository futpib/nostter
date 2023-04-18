import { trpcServer } from "../server";
import { trpcNostrRouter } from "./nostr";

export const trpcRouter = trpcServer.router({
	nostr: trpcNostrRouter,
});

export type TRPCRouter = typeof trpcRouter;
