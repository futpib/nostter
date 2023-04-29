"use client";

import { ProfilePointer } from "nostr-tools/lib/nip19";
import { parsePubkeyMetadataEvents } from "@/utils/parsePubkeyMetadataEvents";
import { useAppQuery } from "@/hooks/useAppQuery";
import { Profile } from "./Profile";
import { ProfilePage } from "./ProfilePage";
import { ProfileTooltipContent } from "./ProfileTooltipContent";
import { DateTime } from "luxon";

const components = {
	ProfilePage,
	Profile,
	ProfileTooltipContent,
};

const Stub = () => null;

const skeletonComponents = {
	ProfilePage: Stub,
	Profile: Stub,
	ProfileTooltipContent: Stub,
};

const ProfileNotFound = () => (
	<div>
		Profile not found
	</div>
);

const notFoundComponents = {
	// TODO
	ProfilePage: ProfileNotFound,
	Profile: ProfileNotFound,
	ProfileTooltipContent: ProfileNotFound,
};

export function ProfileLoader({
	componentKey,
	profilePointer,
	onProfileQuerySuccess,
	now,
}: {
	componentKey: keyof typeof components;
	profilePointer: ProfilePointer;
	now?: DateTime;
	onProfileQuerySuccess?: () => void;
}) {
	const pubkeyMetadataEventQuery = useAppQuery([
		'finite',
		'auto',
		'nostr',
		profilePointer,
		'pubkey',
		profilePointer.pubkey,
		'metadata',
	], {
		onSettled: () => {
			onProfileQuerySuccess?.();
		},
	});

	const Component = components[componentKey];
	const SkeletonComponent = skeletonComponents[componentKey];
	const NotFoundComponent = notFoundComponents[componentKey];

	const pubkeyMetadataEvent = pubkeyMetadataEventQuery.data?.getLatestEvent();

	const pubkeyMetadatas = pubkeyMetadataEvent ? parsePubkeyMetadataEvents([ pubkeyMetadataEvent ]) : undefined;

	const pubkeyMetadata = pubkeyMetadatas?.get(profilePointer.pubkey);

	return pubkeyMetadataEventQuery.isInitialLoading ? (
		<SkeletonComponent />
	) : (
		pubkeyMetadata ? (
			<Component
				pubkey={profilePointer.pubkey}
				pubkeyMetadata={pubkeyMetadata}
				now={now}
			/>
		) : (
			<NotFoundComponent />
		)
	);
}
