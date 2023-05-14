import { NextSeo } from "next-seo";
import { ReactNode } from "react";
import '../(default)/globals.css';
import styles from './layout.module.css'

export default function QueryLayout({
	children
}: {
	children: ReactNode;
}) {
	return (
		<html>
			<head>
				<NextSeo
					useAppDir
					titleTemplate="%s | Nostter"
					openGraph={{
						siteName: 'Nostter',
					}}
				/>
			</head>

			<body
				className={styles.body}
			>
				{children}
			</body>
		</html>
	);
}
