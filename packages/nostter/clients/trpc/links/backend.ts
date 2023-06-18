import { httpLink, OperationResultEnvelope, TRPCLink } from '@trpc/client';
import { getPublicRuntimeConfig } from "@/utils/getPublicRuntimeConfig";
import { ignoreSubscriptionsLink } from './ignoreSubscriptions';
import { TRPCRouter } from '@/trpc/router';
import { hashPublicKeys } from '@/nostr/PublicKeySet';
import invariant from 'invariant';
import * as Rx from 'rxjs';
import * as Rxo from 'rxjs/operators';
import pMemoize from 'p-memoize';
import QuickLRU from 'quick-lru';


const { publicUrl } = getPublicRuntimeConfig();

const backendHttpLink = httpLink({
	url: publicUrl + '/api/trpc',
});

const internPublicKeySetWithHash = pMemoize(async (hash: string, publicKeys: string[]): Promise<string> => {
	const response = await fetch(publicUrl + '/api/public-key-set', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			hash,
			publicKeys,
		}),
	});

	invariant(response.ok, 'Failed to intern public key set.');

	return hash;
}, {
	cacheKey: ([ hash ]) => hash,
	cache: new QuickLRU({
		maxSize: 16,
	}),
});

function internPublicKeySet(publicKeys: string[]): Promise<string> {
	const hash = hashPublicKeys(publicKeys);

	return internPublicKeySetWithHash(hash, publicKeys);
}

const nostterHttpLink = ({
	httpLink,
	authorsLengthThreshold = 128,
}: {
	httpLink: TRPCLink<TRPCRouter>;
	authorsLengthThreshold?: number;
}): TRPCLink<TRPCRouter> => {
	return (runtime) => {
		const operationLink = httpLink(runtime);

		return (props) => {
			if (props.op.type === 'query') {
				if (
					typeof props.op.input === 'object'
						&& props.op.input !== null
						&& 'authors' in props.op.input
				) {
					const authors = (props.op.input as { authors: string[] }).authors;

					if (authors.length > authorsLengthThreshold) {
						const inputPromise = (async () => {
							const hash = await internPublicKeySet(authors);

							const input: {
								authors?: undefined | string[];
								authorsPublicKeySetHash?: undefined | string;
							} = {
								...(props.op.input as {}),
								authors: undefined,
								authorsPublicKeySetHash: hash,
							};

							delete input.authors;

							return input;
						})();

						return (
							Rx.from(inputPromise)
								.pipe(
									Rxo.mergeMap((input) => {
										const childOperation = operationLink({
											...props,
											op: {
												...props.op,
												input,
											},
										});

										return new Rx.Observable<OperationResultEnvelope<unknown>>(observer => {
											return childOperation.subscribe(observer);
										});
									}),
								)
						);
					}
				}
			}

			return operationLink(props);
		};
	};
};

export const backendLink = ignoreSubscriptionsLink({
	childLink: nostterHttpLink({
		httpLink: backendHttpLink,
	}),
});
