import { Nip19DecodeResult } from "./nip19DecodeNEventEventReference";

export type Nip19Note = {
	type: 'note';
	data: string;
};

export function nip19DecodeNote({ type, data }: Nip19DecodeResult): undefined | Nip19Note {
	if (
		type !== 'note'
			|| typeof data !== 'string'
	) {
		return undefined;
	}

	return {
		type: 'note',
		data,
	};
}
