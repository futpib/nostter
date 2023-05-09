import { ReactNode } from 'react';
import { CounterValueText } from './CounterValueText';
import styles from './NoteTextCounter.module.css';

export function NoteTextCounter({
	value,
	label,
}: {
	value: number | bigint;
	label: ReactNode;
}) {
	return (
		<span
			className={styles.noteTextCounter}
		>
			<span>
				<CounterValueText
					value={value}
				/>
			</span>
			<span>{' '}</span>
			<span>{label}</span>
		</span>
	);
}
