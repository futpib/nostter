import { useAccounts } from "@/hooks/useAccounts";
import Link from "next/link";
import { useMemo } from "react";
import styles from "./DrawerXsAccountSwitcher.module.css";
import { DrawerXsPrimaryAccountButton } from "./DrawerXsPrimaryAccountButton";
import { DrawerXsSecondaryAccountButton } from "./DrawerXsSecondaryAccountButton";

export function DrawerXsAccountSwitcher() {
	const { accounts, primaryAccount, isAccountsInitialLoading } = useAccounts();

	const secondaryAccount = useMemo(() => {
		return accounts.find((account) => account.pubkey !== primaryAccount?.pubkey);
	}, [accounts, primaryAccount?.pubkey]);

	return isAccountsInitialLoading ? null : (
		<div
			className={styles.drawerXsAccountSwitcher}
		>
			{primaryAccount && (
				<DrawerXsPrimaryAccountButton
					pubkey={primaryAccount.pubkey}
				/>
			)}

			<div
				className={styles.drawerXsAccountSwitcherButtons}
			>
				{secondaryAccount && (
					<DrawerXsSecondaryAccountButton
						pubkey={secondaryAccount.pubkey}
					/>
				)}
			</div>
		</div>
	)
}
