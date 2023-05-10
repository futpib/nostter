import ContentLoader from "react-content-loader";
import styles from "./ProfileSkeleton.module.css";

export function ProfileSkeleton({
	id,
}: {
	id: string;
}) {
	return (
		<div
			className={styles.profileSkeleton}
			data-test-name="ProfileSkeleton"
		>
			<ContentLoader
				uniqueKey={id}
				speed={2}
				width={600}
				height={348}
				viewBox="0 0 600 348"
				backgroundColor="#f3f3f3"
				foregroundColor="#ecebeb"
			>
				<circle cx="83" cy="199" r="63" />
				<rect x="18" y="284" rx="5" ry="5" width="60" height="10" />
				<rect x="18" y="316" rx="5" ry="5" width="180" height="10" />
			</ContentLoader>
		</div>
	);
}
