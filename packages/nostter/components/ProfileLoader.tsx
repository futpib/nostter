"use client";

import { ProfilePointer } from "nostr-tools/lib/nip19";
import { Profile } from "./Profile";
import { ProfilePage } from "./ProfilePage";
import { ProfileTooltipContent } from "./ProfileTooltipContent";
import { DateTime } from "luxon";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { usePubkeyMetadatasLoader } from "@/hooks/usePubkeyMetadatasLoader";

const components = {
	ProfilePage,
	Profile,
	ProfileTooltipContent,
};

const Stub = () => null;

const skeletonComponents = {
	ProfilePage: ProfileSkeleton,
	Profile: ProfileSkeleton,
	ProfileTooltipContent: Stub,
};

export function ProfileLoader({
	componentKey,
	profilePointer,
	now,
}: {
	componentKey: keyof typeof components;
	profilePointer: ProfilePointer;
	now?: DateTime;
}) {
	const {
		isProfileMetadatasInitialLoading,
		pubkeyMetadatas,
	} = usePubkeyMetadatasLoader({
		profilePointers: [ profilePointer ],
		now,
	});

	const Component = components[componentKey];
	const SkeletonComponent = skeletonComponents[componentKey];

	const pubkeyMetadata = pubkeyMetadatas?.get(profilePointer.pubkey);

	return isProfileMetadatasInitialLoading ? (
		<SkeletonComponent
			id={profilePointer.pubkey}
		/>
	) : (
		<Component
			pubkey={profilePointer.pubkey}
			pubkeyMetadata={pubkeyMetadata}
			now={now}
		/>
	);
}
