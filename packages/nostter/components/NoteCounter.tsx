import { FaRegHeart } from 'react-icons/fa';
import { CounterValueText } from './CounterValueText';
import styles from './NoteCounter.module.css';

export function NoteCounter({
	value,
	iconComponent: IconComponent,
}: {
	value: number | bigint;
	iconComponent: typeof FaRegHeart;
}) {
	return (
		<div
			className={styles.noteCounter}
		>
			<IconComponent />
			<span>
				<CounterValueText
					value={value}
				/>
			</span>
		</div>
	);
}
