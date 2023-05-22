import { nip19 } from "nostr-tools";
import { DecodeResult, EventPointer, ProfilePointer } from "nostr-tools/lib/nip19";

export type Nip19DecodeResultEventPointer = {
	type: 'eventPointer';
	eventPointer: EventPointer;
};

export type Nip19DecodeResultProfilePointer = {
	type: 'profilePointer';
	profilePointer: ProfilePointer;
};

export type Nip19DecodeResult = {
	normalizedNip19Id: string;
	decoded: Nip19DecodeResultEventPointer | Nip19DecodeResultProfilePointer;
};

export function nip19Decode(nip19IdParam: unknown): undefined | Nip19DecodeResult {
	if (typeof nip19IdParam !== 'string') {
		return undefined;
	}

	let nip19IdParamString = nip19IdParam.trim();

	nip19IdParamString = decodeURIComponent(nip19IdParamString);

	if (nip19IdParamString.startsWith('@')) {
		nip19IdParamString = nip19IdParamString.slice(1);
	}

	let nip19DecodeResult: undefined | DecodeResult;

	try {
		nip19DecodeResult = nip19.decode(nip19IdParamString);
	} catch (error) {
		if (error instanceof Error) {
			error.message = `nip19Decode(${nip19IdParamString}): ${error.message}`;
		}

		console.warn(error);

		return undefined;
	}

	const { type, data } = nip19DecodeResult;

	if (type === 'note' && typeof data === 'string') {
		const eventPointer: EventPointer = {
			id: data,
		};

		return {
			normalizedNip19Id: nip19.noteEncode(eventPointer.id),
			decoded: {
				type: 'eventPointer',
				eventPointer,
			},
		};
	}

	if (type === 'nevent' && typeof data === 'object' && 'id' in data) {
		const eventPointer: EventPointer = data;

		return {
			normalizedNip19Id: nip19.noteEncode(eventPointer.id),
			decoded: {
				type: 'eventPointer',
				eventPointer,
			},
		};
	}

	if (type === 'npub' && typeof data === 'string') {
		const profilePointer: ProfilePointer = {
			pubkey: data,
		};

		return {
			normalizedNip19Id: nip19.npubEncode(profilePointer.pubkey),
			decoded: {
				type: 'profilePointer',
				profilePointer,
			},
		};
	}

	if (type === 'nprofile' && typeof data === 'object' && 'pubkey' in data) {
		const profilePointer: ProfilePointer = data;

		return {
			normalizedNip19Id: nip19.npubEncode(profilePointer.pubkey),
			decoded: {
				type: 'profilePointer',
				profilePointer,
			},
		};
	}

	return undefined;
}
