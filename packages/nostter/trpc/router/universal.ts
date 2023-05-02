import { trpcServer } from "../server";
import { trpcNostrRouter } from "./nostr";
import type { TRPCRouter } from '.';

export const trpcUniversalRouter = trpcServer.router({
	nostr: trpcNostrRouter,
}) as TRPCRouter;
