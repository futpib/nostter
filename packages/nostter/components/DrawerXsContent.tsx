import { HeaderHomeButton } from "./HeaderHomeButton";
import { HeaderExploreButton } from "./HeaderExploreButton";
import { HeaderProfileButton } from "./HeaderProfileButton";
import styles from './DrawerXsContent.module.css';

export function DrawerXsContent() {
	return (
		<>
			<HeaderHomeButton
				className={styles.drawerHeaderButton}
			/>
			<HeaderExploreButton
				className={styles.drawerHeaderButton}
			/>
			<HeaderProfileButton
				className={styles.drawerHeaderButton}
			/>
		</>
	);
}
