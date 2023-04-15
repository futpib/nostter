import { Duration } from "luxon";

export type TRPCMetaCacheControl = {
	public?: boolean;
	immutable?: boolean;
	maxAge?: Duration;
	sMaxAge?: Duration;
	staleWhileRevalidate?: Duration;
};

export type TRPCMeta = {
	cacheControl?: TRPCMetaCacheControl | {
		empty?: TRPCMetaCacheControl;
		nonEmpty?: TRPCMetaCacheControl;
	};
};
