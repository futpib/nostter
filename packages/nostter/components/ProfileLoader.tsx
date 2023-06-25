"use client";

import { ProfilePointer } from "nostr-tools/lib/nip19";
import { Profile } from "./Profile";
import { ProfilePage } from "./ProfilePage";
import { ProfileFollowingPage } from "./ProfileFollowingPage";
import { ProfileTooltipContent } from "./ProfileTooltipContent";
import { DateTime } from "luxon";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { usePubkeyMetadatasLoader } from "@/hooks/usePubkeyMetadatasLoader";
import { ProfileListItem } from "./ProfileListItem";
import { ProfileListItemSkeleton } from "./ProfileListItemSkeleton";
import { EventSet } from "@/nostr/EventSet";

const components = {
	ProfilePage,
	ProfileFollowingPage,
	Profile,
	ProfileTooltipContent,
	ProfileListItem,
};

const Stub = () => null;

const skeletonComponents = {
	ProfilePage: ProfileSkeleton,
	ProfileFollowingPage: Stub,
	Profile: ProfileSkeleton,
	ProfileTooltipContent: Stub,
	ProfileListItem: ProfileListItemSkeleton,
};

export function ProfileLoader({
	componentKey,
	profilePointer,
	pubkeyPreloadedEventSet,
	now,
}: {
	componentKey: keyof typeof components;
	profilePointer: ProfilePointer;
	pubkeyPreloadedEventSet?: EventSet;
	now?: string | DateTime;
}) {
	const {
		isProfileMetadatasInitialLoading,
		pubkeyMetadatas,
	} = usePubkeyMetadatasLoader({
		profilePointers: [ profilePointer ],
		pubkeyPreloadedEventSet,
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
