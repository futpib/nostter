
export type HeightRange = [ startInclusive: bigint, endExclusive: bigint ];

function min(a: bigint, b: bigint): bigint {
	return a < b ? a : b;
}

export class StateHeightHelpers {
	static getTaskEventHeightRange({
		current,
		target,
		limit = 32n,
	}: {
		current: bigint;
		target: bigint;
		limit?: bigint;
	}): {
		reached: bigint;
		range: HeightRange;
	} {
		const endExclusive = min(current + limit, target + 1n);
		const endInclusive = endExclusive - 1n;

		const range: HeightRange = [
			current + 1n,
			endExclusive,
		];

		return {
			reached: endInclusive,
			range,
		};
	}
}
