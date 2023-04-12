import * as linkify from 'linkifyjs';
import mem from 'mem';

export type Link = {
	type: string;
	value: string;
	isLink: boolean;
	href: string;
	start: number;
	end: number;
};

export const findLinks = mem(linkify.find);
