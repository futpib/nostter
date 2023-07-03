import mem from "mem";
import { nip19 } from 'nostr-tools';
import QuickLRU from 'quick-lru';

export const npubEncode = mem((hex: string) => nip19.npubEncode(hex), {
	cache: new QuickLRU({ maxSize: 64 }),
	cacheKey: ([ hex ]) => hex,
});
