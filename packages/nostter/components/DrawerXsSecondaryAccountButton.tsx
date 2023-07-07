import { usePubkeyMetadatasLoader } from "@/hooks/usePubkeyMetadatasLoader";
import { Image } from "./Image";
import styles from "./DrawerXsSecondaryAccountButton.module.css";
import { usePreferencesLocalStorage } from "@/hooks/usePreferencesLocalStorage";

export function DrawerXsSecondaryAccountButton({
	pubkey,
}: {
	pubkey: string;
}) {
	const { setPrimaryAccountPubkey } = usePreferencesLocalStorage();

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
		<Image
			className={styles.drawerXsSecondaryAccountButton}
			src={pubkeyMetadata?.picture}
			onClick={() => {
				setPrimaryAccountPubkey(pubkey);
			}}
		/>
	);
}
