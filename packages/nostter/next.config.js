const { VERCEL_URL } = process.env;

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: true,
	},

	publicRuntimeConfig: {
		publicUrl: VERCEL_URL ? `https://${VERCEL_URL}` : 'http://localhost:3002',
	},

	async redirects() {
		return [
			{
				source: '/note/:nip19Id',
				destination: '/:nip19Id',
				permanent: true,
			},
		]
	},
};

module.exports = nextConfig;
