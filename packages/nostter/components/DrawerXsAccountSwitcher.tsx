import { useAccounts } from "@/hooks/useAccounts";
import { useMemo } from "react";
import styles from "./DrawerXsAccountSwitcher.module.css";
import { DrawerXsPrimaryAccountButton } from "./DrawerXsPrimaryAccountButton";

export function DrawerXsAccountSwitcher() {
	const { accounts, primaryAccount, isAccountsInitialLoading } = useAccounts();

	const secondaryAccount = useMemo(() => {
		return accounts.find((account) => account.pubkey !== primaryAccount?.pubkey);
	}, [accounts, primaryAccount?.pubkey]);

	const otherAccounts = useMemo(() => {
		return (
			accounts
				.filter((account) => (
					account.pubkey !== primaryAccount?.pubkey
					&& account.pubkey !== secondaryAccount?.pubkey
				))
		);
	}, [accounts, primaryAccount?.pubkey, secondaryAccount?.pubkey]);

	return isAccountsInitialLoading ? null : (
		<div
			className={styles.drawerXsAccountSwitcher}
		>
			{primaryAccount && (
				<DrawerXsPrimaryAccountButton
					pubkey={primaryAccount.pubkey}
				/>
			)}
		</div>
	)
}
