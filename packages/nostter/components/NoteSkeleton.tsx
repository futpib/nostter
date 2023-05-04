import ContentLoader from "react-content-loader";
import styles from "./NoteSkeleton.module.css";

export function NoteSkeleton({
	id,
}: {
	id: string;
}) {
	return (
		<div
			className={styles.noteSkeleton}
			data-test-name="NoteSkeleton"
		>
			<ContentLoader
				uniqueKey={id}
				speed={2}
				width={600}
				height={160}
				viewBox="0 0 600 160"
				backgroundColor="#f3f3f3"
				foregroundColor="#ecebeb"
			>
				<circle cx="40" cy="36" r="24" />
				<rect x="76" y="19" rx="5" ry="5" width="240" height="12" />
				<rect x="17" y="83" rx="5" ry="5" width="520" height="10" />
				<rect x="17" y="105" rx="5" ry="5" width="450" height="10" />
				<rect x="17" y="145" rx="5" ry="5" width="520" height="10" />
			</ContentLoader>
		</div>
	);
}
