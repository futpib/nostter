import { useMemo } from "react";

export function CounterValueText({
	value,
}: {
	value: number | bigint;
}) {
	const valueText = useMemo(() => {
		const valueBigInt = BigInt(value);

		if (valueBigInt < 1000n) {
			return valueBigInt.toString();
		}

		if (valueBigInt < 1000000n) {
			return `${(valueBigInt / 1000n)}K`;
		}

		if (valueBigInt < 1000000000n) {
			return `${(valueBigInt / 1000000n)}M`;
		}

		return `${(valueBigInt / 1000000000n)}B`;
	}, [value]);

	return (
		<>
			{valueText}
		</>
	);
}
