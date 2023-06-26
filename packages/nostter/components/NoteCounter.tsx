import classNames from 'classnames';
import { FaRegHeart } from 'react-icons/fa';
import { CounterValueText } from './CounterValueText';
import styles from './NoteCounter.module.css';

export function NoteCounter({
	active = false,
	className,
	iconClassName,
	activeIconClassName,
	value,
	iconComponent: IconComponent,
	activeIconComponent: ActiveIconComponent = IconComponent,
}: {
	active?: boolean;
	className?: string;
	iconClassName?: string;
	activeIconClassName?: string;
	value: number | bigint;
	iconComponent: typeof FaRegHeart;
	activeIconComponent?: typeof FaRegHeart;
}) {
	return (
		<div
			className={classNames(styles.noteCounter, className)}
		>
			{active ? (
				<ActiveIconComponent
					className={classNames(styles.icon, iconClassName, activeIconClassName)}
				/>
			) : (
				<IconComponent
					className={classNames(styles.icon, iconClassName)}
				/>
			)}

			<span>
				<CounterValueText
					value={value}
				/>
			</span>
		</div>
	);
}
