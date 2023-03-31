import getConfigBase from "next/config";

let {
	VERCEL_URL,
	NEXT_PUBLIC_VERCEL_URL,
} = process.env;

VERCEL_URL = VERCEL_URL || NEXT_PUBLIC_VERCEL_URL;

export type Config = {
	publicRuntimeConfig: {
		publicUrl: string;
	};
};

export function getConfig(): Config {
	const config = getConfigBase();

	if (config) {
		return config;
	}

	return {
		publicRuntimeConfig: {
			publicUrl: VERCEL_URL ? `https://${VERCEL_URL}` : 'http://localhost:3002',
		},
	};
}
