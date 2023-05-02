import { createTRPCContext } from "./context";
import { trpcRouter } from "./router";

export async function createTRPCCaller() {
	const context = await createTRPCContext();
	return trpcRouter.createCaller(context);
}
