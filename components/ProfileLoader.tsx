"use client";

import { ProfilePointer } from "nostr-tools/lib/nip19";
import { parsePubkeyMetadataEvents } from "@/utils/parsePubkeyMetadataEvents";
import { useAppQuery } from "@/hooks/useAppQuery";
import { Profile } from "./Profile";
import { ProfilePage } from "./ProfilePage";

const components = {
	ProfilePage,
	Profile,
};

const Stub = () => null;

const skeletonComponents = {
	ProfilePage: Stub,
	Profile: Stub,
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
};

export function ProfileLoader({
	componentKey,
	profilePointer,
}: {
	componentKey: keyof typeof components;
	profilePointer: ProfilePointer;
}) {
	const pubkeyMetadataEventQuery = useAppQuery([
		'finite',
		'auto',
		'nostr',
		profilePointer,
		'pubkey',
		profilePointer.pubkey,
		'metadata',
	]);

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
			/>
		) : (
			<NotFoundComponent />
		)
	);
}
