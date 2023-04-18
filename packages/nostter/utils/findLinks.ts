import * as linkify from 'linkifyjs';
import 'linkify-plugin-hashtag';
import mem from 'mem';

export type Link = {
	type: string;
	value: string;
	isLink: boolean;
	href: string;
	start: number;
	end: number;
};

linkify.registerCustomProtocol('mailto', true);
linkify.registerCustomProtocol('wss');

export const findLinks = mem(linkify.find);
