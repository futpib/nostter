export class BigIntMath {
	static min(a: bigint, b: bigint): bigint {
		return a < b ? a : b;
	}

	static max(a: bigint, b: bigint): bigint {
		return a > b ? a : b;
	}
}
