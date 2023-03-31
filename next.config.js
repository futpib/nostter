const { VERCEL_URL } = process.env;

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
