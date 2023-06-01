import classNames from "classnames";
import { ComponentProps } from "react";
import { AccountButtonContent } from "./AccountButtonContent";
import styles from "./HeaderAccountButtonContent.module.css";

export function HeaderAccountButtonContent(props: ComponentProps<typeof AccountButtonContent>) {
	return (
		<AccountButtonContent
			namesClassName={classNames(props.namesClassName, styles.headerAccountButtonContentNames)}
			{...props}
		/>
	);
}
