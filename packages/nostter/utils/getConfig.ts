import getConfigBase from 'next/config';
import { PartialDeep } from 'type-fest';

const { VERCEL_URL } = process.env;

export type Config = {
	publicRuntimeConfig: {
		publicUrl: string;
	};
};

export function getConfig(): Config {
	const config: undefined | PartialDeep<Config> = getConfigBase();

	const browserUrl = typeof window !== 'undefined' ? window.location.origin : undefined;

	return {
		...config,
		publicRuntimeConfig: {
			...config?.publicRuntimeConfig,
			publicUrl: VERCEL_URL ? `https://${VERCEL_URL}` : (browserUrl ?? 'http://localhost:3002'),
		},
	};
}
