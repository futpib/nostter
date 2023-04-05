"use client";

import { patchFetchForClientOnlyNavigation } from "@/next/hacks";
import { QueryClient, QueryClientProvider as QueryClientProviderBase } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode, useEffect, useMemo } from "react"

export function QueryClientProvider({
	children,
}: {
	children: ReactNode;
}) {
	const queryClient = useMemo(() => new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
			},
		},
	}), [])

	useEffect(() => {
		return patchFetchForClientOnlyNavigation();
	}, [])

	return (
		<QueryClientProviderBase client={queryClient}>
			{children}
			<ReactQueryDevtools />
		</QueryClientProviderBase>
	);
}
