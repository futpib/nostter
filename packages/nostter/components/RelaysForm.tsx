'use client';

import { useRelays } from '@/hooks/useRelays';
import { useState } from 'react';
import styles from './RelaysForm.module.css';

export function RelaysForm() {
	const {
		relays,

		setRelayPreferences,
		removeRelayPreferences,
	} = useRelays();

	const [ addRelayUrl, setAddRelayUrl ] = useState('');

	return (
		<>
			{Object.entries(relays).map(([ relayUrl, relayPreferences ]) => {
				return (
					<div
						key={relayUrl}
						className={styles.listItem}
					>
						<div
							className={styles.listItemUrl}
						>
							{relayUrl}
						</div>

						<div
							className={styles.listItemActions}
						>
							<button
								onClick={() => {
									removeRelayPreferences(relayUrl);
								}}
							>
								Remove
							</button>
						</div>
					</div>
				);
			})}

			<div className={styles.divider} />

			<div className={styles.addRelay}>
				<input
					type="text"
					placeholder="Add relay URL"
					value={addRelayUrl}
					onChange={(event) => {
						setAddRelayUrl(event.target.value);
					}}
				/>

				<button
					onClick={() => {
						setRelayPreferences(addRelayUrl, {
							read: true,
							write: true,
						});
						setAddRelayUrl('');
					}}
				>
					Add
				</button>
			</div>
		</>
	);
}
