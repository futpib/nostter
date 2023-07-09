import { HeaderAccountButton } from "./HeaderAccountButton";
import { HeaderProfileButton } from "./HeaderProfileButton";
import styles from "./HeaderContent.module.css";
import { HeaderExploreButton } from "./HeaderExploreButton";
import { HeaderHomeButton } from "./HeaderHomeButton";
import { HeaderPreferencesButton } from "./HeaderPreferencesButton";

export function HeaderContent() {
	return (
		<>
			<div
				className={styles.headerContentTop}
			>
				<HeaderHomeButton />
				<HeaderExploreButton />
				<HeaderProfileButton />
				<HeaderPreferencesButton />
			</div>

			<div>
				<HeaderAccountButton />
			</div>
		</>
	);
}
