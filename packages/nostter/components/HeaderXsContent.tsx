import { HeaderXsAccountButton } from "./HeaderXsAccountButton";
import styles from "./HeaderXsContent.module.css";

export function HeaderXsContent() {
	return (
		<>
			<div className={styles.headerXsContentButtonsRow}>
				<HeaderXsAccountButton />
			</div>
		</>
	);
}
