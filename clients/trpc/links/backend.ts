import { httpLink } from '@trpc/client';
import { getPublicRuntimeConfig } from "@/utils/getPublicRuntimeConfig";

const { publicUrl } = getPublicRuntimeConfig();

export const backendLink = httpLink({
	url: publicUrl + '/api/trpc',
});
