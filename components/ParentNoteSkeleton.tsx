import ContentLoader from "react-content-loader";
import styles from "./ParentNoteSkeleton.module.css";
import { useScrollKeeper } from "@/hooks/useScrollKeeper";

export function ParentNoteSkeleton({
	id,
}: {
	id: string;
}) {
	const { handleReflow } = useScrollKeeper();

	return (
		<div
			ref={handleReflow}
			className={styles.parentNoteSkeleton}
		>
			<ContentLoader
				uniqueKey={id}
				speed={2}
				width={600}
				height={120}
				viewBox="0 0 600 120"
				backgroundColor="#f3f3f3"
				foregroundColor="#ecebeb"
			>
				<circle cx="40" cy="36" r="24" />
				<rect x="76" y="19" rx="5" ry="5" width="240" height="12" />
				<rect x="75" y="46" rx="5" ry="5" width="494" height="10" />
				<rect x="75" y="66" rx="5" ry="5" width="380" height="10" />
			</ContentLoader>
		</div>
	);
}
