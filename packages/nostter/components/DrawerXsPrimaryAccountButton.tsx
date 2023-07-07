import { usePubkeyMetadatasLoader } from "@/hooks/usePubkeyMetadatasLoader";
import { Image } from "./Image";
import styles from "./DrawerXsPrimaryAccountButton.module.css";
import { ProfileMentionNameText } from "./ProfileMentionNameText";
import Link from "next/link";
import { npubEncode } from "@/utils/npubEncode";

export function DrawerXsPrimaryAccountButton({
	pubkey,
}: {
	pubkey: string;
}) {
	const {
		pubkeyMetadatas,
	} = usePubkeyMetadatasLoader({
		profilePointers: [
			{
				pubkey,
			},
		],
	});

	const pubkeyMetadata = pubkeyMetadatas.get(pubkey);

	return (
		<Link
			className={styles.drawerXsPrimaryAccountButton}
			href={`/${npubEncode(pubkey)}`}
		>
			<Image
				className={styles.avatar}
				src={pubkeyMetadata?.picture}
			/>

			<div className={styles.names}>
				<div
					className={styles.displayName}
				>
					{pubkeyMetadata?.display_name}
				</div>

				<div
					className={styles.name}
				>
					<ProfileMentionNameText
						pubkey={pubkey}
						pubkeyMetadatas={pubkeyMetadatas}
					/>
				</div>
			</div>
		</Link>
	);
}
