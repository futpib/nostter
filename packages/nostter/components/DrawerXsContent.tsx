import { HeaderHomeButton } from "./HeaderHomeButton";
import { HeaderExploreButton } from "./HeaderExploreButton";
import { HeaderProfileButton } from "./HeaderProfileButton";
import styles from './DrawerXsContent.module.css';
import { DrawerXsAccountSwitcher } from "./DrawerXsAccountSwitcher";

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
		</>
	);
}
