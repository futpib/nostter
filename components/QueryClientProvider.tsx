"use client";

import { queryKeyHashFn } from "@/clients/prehashQueryKey";
import { queryFn } from "@/clients/queryFn";
import { debugExtend } from "@/utils/debugExtend";
import { QueryClient, QueryClientProvider as QueryClientProviderBase, QueryFunction, QueryKey, QueryKeyHashFunction } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode, useEffect, useMemo, useRef } from "react"

const log = debugExtend('components', 'QueryClientProvider');

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
					refetchOnWindowFocus: true,
					refetchOnMount: false,
					refetchOnReconnect: false,
				},
			},
		});

		const queryCache = queryClient.getQueryCache();

		const unsubscribe = queryCache.subscribe(event => {
			log('queryCache', event);
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
		<QueryClientProviderBase client={queryClient}>
			{children}
			<ReactQueryDevtools />
		</QueryClientProviderBase>
	);
}
