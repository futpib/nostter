import { ReactNode } from 'react';
import classNames from 'classnames';
import { Noto_Sans as NotoSans, Noto_Color_Emoji as NotoColorEmoji } from 'next/font/google';
import '../(default)/globals.css'
import { NextSeo } from 'next-seo';
import styles from './layout.module.css'
import { QueryClientProvider } from '@/components/QueryClientProvider';
import { ScrollKeeperProvider } from '@/components/ScrollKepeerProvider';
import { PreferencesProvider } from '@/components/PreferencesProvider';

const notoSans = NotoSans({
	variable: '--font-noto-sans',
	weight: ['400', '700'],
	subsets: ['latin'],
	display: 'swap',
});

const notoColorEmoji = NotoColorEmoji({
	variable: '--font-noto-color-emoji',
	weight: ['400'],
	subsets: ['emoji'],
	display: 'swap',
});

export default function RootSettingsLayout({
	children
}: {
	children: ReactNode;
}) {
	return (
		<html className={classNames(notoSans.variable, notoColorEmoji.variable)}>
			<head>
				<NextSeo
					useAppDir
					titleTemplate="%s | Nostter"
					openGraph={{
						siteName: 'Nostter',
					}}
				/>
			</head>

			<PreferencesProvider>
				<QueryClientProvider>
					<ScrollKeeperProvider>
						<body className={styles.body}>
							<header className={styles.header}>
								{/* TODO: header */}
							</header>

							<main className={styles.main}>
								<div className={styles.content}>
									{children}
								</div>
							</main>
						</body>
					</ScrollKeeperProvider>
				</QueryClientProvider>
			</PreferencesProvider>
		</html>
	);
}
