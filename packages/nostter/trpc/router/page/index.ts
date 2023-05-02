import { z } from 'zod';
import { trpcServer } from "@/trpc/server";
import { maxCacheTime } from '@/utils/setCacheControlHeader';
import { combineMetaMiddleware } from '@/trpc/middlewares';
import { SAXParser } from 'parse5-sax-parser';

export const trpcPageRouter = trpcServer.router({
	metadata: trpcServer.procedure
		.use(combineMetaMiddleware)
		.meta({
			cacheControl: {
				public: true,
				immutable: true,
				maxAge: maxCacheTime,
			},
		})
		.input(z.object({
			url: z.string().url(),
		}))
		.query(async ({ input: { url } }) => {
			const parser = new SAXParser();

			const metadata: {
				url: string;
				title?: string;
				description?: string;
				siteName?: string;
				image?: string;
			} = {
				url,
			};

			parser.on('startTag', (startTag) => {
				if (startTag.tagName !== 'meta') {
					return;
				}

				const nameAttribute = startTag.attrs.find((attr) => attr.name === 'name');
				const propertyAttribute = startTag.attrs.find((attr) => attr.name === 'property');
				const contentAttribute = startTag.attrs.find((attr) => attr.name === 'content');

				if (
					(
						propertyAttribute?.value === 'og:title'
							|| nameAttribute?.value === 'title'
					)
						&& contentAttribute?.value
				) {
					metadata.title = contentAttribute.value;
				}

				if (
					(
						propertyAttribute?.value === 'og:description'
							|| nameAttribute?.value === 'description'
					)
						&& contentAttribute?.value
				) {
					metadata.description = contentAttribute.value;
				}

				if (
					(
						propertyAttribute?.value === 'og:site_name'
					)
						&& contentAttribute?.value
				) {
					metadata.siteName = contentAttribute.value;
				}

				if (
					(
						propertyAttribute?.value === 'og:image'
					)
						&& contentAttribute?.value
				) {
					metadata.image = contentAttribute.value;
				}
			});

			const pageResponse = await fetch(url);

			if (!pageResponse.ok || !pageResponse.body) {
				return {};
			}

			let consumedLength = 0;

			for await (const chunk of (pageResponse.body as any)) {
				const chunk_: Uint8Array = chunk;
				const chunkString = new TextDecoder().decode(chunk_);
				parser.write(chunkString);
				consumedLength += chunk_.length;

				if (consumedLength > 1024 * 1024) {
					break;
				}
			}

			return {
				metadata,
			};
		}),
});
