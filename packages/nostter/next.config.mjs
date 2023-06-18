const {
	VERCEL_URL,
} = process.env;

/** @type {import('next').NextConfig} */
export default {
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
		];
	},

	async rewrites() {
		return {
			beforeFiles: [
				{
					source: '/',
					has: [
						{
							type: 'host',
							value: 'query.nostter.com',
						},
					],
					destination: '/subdomains/query/',
				},
			],
		};
	},
};
