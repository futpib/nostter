import { nip19 } from 'nostr-tools';

export type Nip19DecodeResult = ReturnType<typeof nip19.decode>;
export type Nip19NEventEventPointer = {
	type: 'nevent';
	data: nip19.EventPointer;
};

export function nip19DecodeNEventEventReference(
	{ type, data }: Nip19DecodeResult,
): undefined | Nip19NEventEventPointer {
	if (
		type !== "nevent"
		|| typeof data !== "object"
		|| !('id' in data)
		|| typeof data.id !== "string"
	) {
		return undefined;
	}

	return { type, data };
}
