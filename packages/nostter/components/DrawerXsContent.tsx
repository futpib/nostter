import { HeaderHomeButton } from "./HeaderHomeButton";
import { HeaderExploreButton } from "./HeaderExploreButton";
import { HeaderProfileButton } from "./HeaderProfileButton";
import styles from './DrawerXsContent.module.css';
import { DrawerXsAccountSwitcher } from "./DrawerXsAccountSwitcher";
import { HeaderPreferencesButton } from "./HeaderPreferencesButton";

export function DrawerXsContent() {
	return (
		<>
			<DrawerXsAccountSwitcher />

			<HeaderHomeButton
				className={styles.drawerHeaderButton}
			/>
			<HeaderExploreButton
				className={styles.drawerHeaderButton}
			/>
			<HeaderProfileButton
				className={styles.drawerHeaderButton}
			/>
			<HeaderPreferencesButton
				className={styles.drawerHeaderButton}
			/>
		</>
	);
}
