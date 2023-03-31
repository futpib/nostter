import ContentLoader from "react-content-loader";
import styles from "./EmbeddedNoteSkeleton.module.css";

export function EmbeddedNoteSkeleton() {
	return (
		<div className={styles.embeddedNoteSkeleton}>
			<ContentLoader
				speed={2}
				width={568}
				height={120}
				viewBox="0 0 568 120"
				backgroundColor="#f3f3f3"
				foregroundColor="#ecebeb"
			>
				<circle cx="22" cy="22" r="10" />
				<rect x="38" y="16" rx="5" ry="5" width="240" height="12" />
				<rect x="12" y="40" rx="5" ry="5" width="520" height="10" />
				<rect x="12" y="60" rx="5" ry="5" width="450" height="10" />
				<rect x="12" y="100" rx="5" ry="5" width="520" height="10" />
			</ContentLoader>
		</div>
	);
}
