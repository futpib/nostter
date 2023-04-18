import invariant from "invariant";
import debug from 'debug';

export function debugEnabled(...namespaces: string[]) {
	invariant(namespaces.length > 0, 'No namespaces');

	const namespacesStack = [ 'nostter' ];

	for (const namespace of namespaces) {
		if (namespace === '..') {
			namespacesStack.pop();
		} else {
			namespacesStack.push(namespace);
		}
	}

	return debug.enabled(namespacesStack.join(':'));
};
