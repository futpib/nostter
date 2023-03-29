
const {
	VERCEL_URL,
} = process.env;

export const publicUrl = VERCEL_URL ? `https://${VERCEL_URL}` : 'http://localhost:3002';
