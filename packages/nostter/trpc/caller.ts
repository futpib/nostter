import { createTRPCContext } from "./context";
import { trpcUniversalRouter } from "./router/universal";

export async function createUniversalTRPCCaller() {
	const context = await createTRPCContext();
	return trpcUniversalRouter.createCaller(context);
}
