import { ReactNode } from 'react';
import styles from './NoteTextCounter.module.css';

export function NoteTextCounter({
	value,
	label,
}: {
	value: number;
	label: ReactNode;
}) {
	return (
		<span
			className={styles.noteTextCounter}
		>
			<span>{value}</span>
			<span>{' '}</span>
			<span>{label}</span>
		</span>
	);
}
