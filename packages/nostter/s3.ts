import { S3 } from '@aws-sdk/client-s3';
import invariant from 'invariant';

const {
	S3_ACCESS_KEY_ID,
	S3_SECRET_ACCESS_KEY,
} = process.env;

invariant(S3_ACCESS_KEY_ID, 'S3_ACCESS_KEY_ID not set');
invariant(S3_SECRET_ACCESS_KEY, 'S3_SECRET_ACCESS_KEY not set');

export const s3 = new S3({
	credentials: {
		accessKeyId: S3_ACCESS_KEY_ID,
		secretAccessKey: S3_SECRET_ACCESS_KEY,
	},
	region: 'eu-west-1',
	forcePathStyle: true,
	endpoint: 'https://gateway.storjshare.io',
});
