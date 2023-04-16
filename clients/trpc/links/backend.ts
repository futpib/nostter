import { httpLink } from '@trpc/client';
import { getPublicRuntimeConfig } from "@/utils/getPublicRuntimeConfig";
import { ignoreSubscriptionsLink } from './ignoreSubscriptions';

const { publicUrl } = getPublicRuntimeConfig();

export const backendLink = ignoreSubscriptionsLink({
	childLink: httpLink({
		url: publicUrl + '/api/trpc',
	}),
});
