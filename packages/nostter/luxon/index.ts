
import { DateTime, DateTimeUnit } from 'luxon';

type DateTimeUnitExtra =
	| DateTimeUnit
	| '5minutes'
;

export function startOf(dateTime: DateTime, unit: DateTimeUnitExtra) {
	if (unit === '5minutes') {
		const startOfMinute = dateTime.startOf('minute');
		const reminder = startOfMinute.minute % 5;

		return startOfMinute.minus({ minutes: reminder });
	}

	return dateTime.startOf(unit);
}
