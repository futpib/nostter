"use client";

import { QueryClient, QueryClientProvider as QueryClientProviderBase } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode, useMemo } from "react"

export function QueryClientProvider({
	children,
}: {
	children: ReactNode;
}) {
	const queryClient = useMemo(() => new QueryClient(), [])

	return (
		<QueryClientProviderBase client={queryClient}>
			{children}
			<ReactQueryDevtools />
		</QueryClientProviderBase>
	);
}
