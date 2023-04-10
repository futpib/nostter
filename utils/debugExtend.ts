import invariant from 'invariant';
import debug from 'debug';

const debugLog = debug('nostter');

if (typeof window !== 'undefined') {
	const namespaces = process.env.NEXT_PUBLIC_DEBUG;
	if (namespaces) {
		debug.enable(namespaces);
		debug.log('debug enabled by NEXT_PUBLIC_DEBUG', namespaces);
	}
}

export function debugExtend(...namespaces: string[]) {
	invariant(namespaces.length > 0, 'No namespaces');

	let extendedLog = debugLog;

	for (const namespace of namespaces) {
		extendedLog = extendedLog.extend(namespace);
	}

	return extendedLog;
}
