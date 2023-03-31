const VERCEL_URL = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: true,
	},

	publicRuntimeConfig: {
		publicUrl: VERCEL_URL ? `https://${VERCEL_URL}` : 'http://localhost:3002',
	},
};

module.exports = nextConfig;
