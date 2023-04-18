import { ComponentType } from 'react';
import styles from './NoteCounter.module.css';

export function NoteCounter({
	value,
	iconComponent: IconComponent,
}: {
	value: number;
	iconComponent: ComponentType;
}) {
	return (
		<div
			className={styles.noteCounter}
		>
			<IconComponent />
			<span>{value}</span>
		</div>
	);
}
