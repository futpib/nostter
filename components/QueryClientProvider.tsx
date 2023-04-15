"use client";

import { handleSuccess } from "@/clients/handleSuccess";
import { handleTRPCSuccess } from "@/clients/handleTRPCSuccess";
import { queryKeyHashFn } from "@/clients/prehashQueryKey";
import { queryFn } from "@/clients/queryFn";
import { trpcClient, trpcReact } from "@/clients/trpc";
import { debugExtend } from "@/utils/debugExtend";
import { QueryClient, QueryClientProvider as QueryClientProviderBase, QueryFunction, QueryKey, QueryKeyHashFunction } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode, useEffect, useMemo, useRef } from "react"

const log = debugExtend('components', 'QueryClientProvider');

const TRPCReactProvider = trpcReact.Provider;

export function QueryClientProvider({
	children,
}: {
	children: ReactNode;
}) {
	const teardownCallbacksRef = useRef<(() => void)[]>([]);

	const queryClient = useMemo(() => {
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					queryFn: queryFn as QueryFunction,
					queryKeyHashFn: queryKeyHashFn as QueryKeyHashFunction<QueryKey>,
					refetchOnWindowFocus: false,
					refetchOnMount: false,
					refetchOnReconnect: false,
				},
			},
		});

		const queryCache = queryClient.getQueryCache();

		const unsubscribe = queryCache.subscribe(event => {
			log('queryCache', event.query.queryKey, event);

			if (event.type === 'updated' && event.action.type === 'success') {
				if (Array.isArray(event.query.queryKey[0])) {
					handleTRPCSuccess(event.query, event.query.queryKey, event.action.data);
				}
			}
		});

		teardownCallbacksRef.current.push(unsubscribe);

		return queryClient;
	}, []);

	useEffect(() => {
		return () => {
			for (const teardownCallback of teardownCallbacksRef.current) {
				teardownCallback();
			}
		};
	}, []);

	return (
		<TRPCReactProvider client={trpcClient} queryClient={queryClient}>
			<QueryClientProviderBase client={queryClient}>
				{children}
				<ReactQueryDevtools />
			</QueryClientProviderBase>
		</TRPCReactProvider>
	);
}
