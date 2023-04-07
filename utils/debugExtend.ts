import invariant from 'invariant';
import debug from 'debug';

const debugLog = debug('nostter');

export function debugExtend(...namespaces: string[]) {
	invariant(namespaces.length > 0, 'No namespaces');

	let extendedLog = debugLog;

	for (const namespace of namespaces) {
		extendedLog = extendedLog.extend(namespace);
	}

	return extendedLog;
}
