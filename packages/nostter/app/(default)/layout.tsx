import { ReactNode } from 'react';
import classNames from 'classnames';
import { Analytics } from '@vercel/analytics/react';
import { Noto_Sans as NotoSans, Noto_Color_Emoji as NotoColorEmoji } from 'next/font/google';
import './globals.css'
import { NextSeo } from 'next-seo';
import styles from './layout.module.css'
import { QueryClientProvider } from '@/components/QueryClientProvider';
import { ScrollKeeperProvider } from '@/components/ScrollKepeerProvider';
import { PreferencesProvider } from '@/components/PreferencesProvider';
import { FooterContent } from '@/components/FooterContent';
import { HeaderContent } from '@/components/HeaderContent';
import { FooterSmContent } from '@/components/FooterSmContent';
import { ScrollDirectionClassNameSetter } from '@/components/ScrollDirectionClassNameSetter';
import { HeaderXsContent } from '@/components/HeaderXsContent';
import { DrawerXs } from '@/components/DrawerXs';
import { DrawerXsStateProvider } from '@/components/DrawerXsStateProvider';

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

export default function RootLayout({
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
						<ScrollDirectionClassNameSetter>
							<DrawerXsStateProvider>
								<body className={styles.body}>
									<header className={styles.header}>
										<HeaderContent />
									</header>

									<main className={styles.main}>
										<header className={styles.headerXs}>
											<HeaderXsContent />
										</header>

										<div className={styles.content}>
											{children}
										</div>

										<footer className={styles.footerSm}>
											<FooterSmContent />
										</footer>
									</main>

									<footer className={styles.footer}>
										<FooterContent />
									</footer>

									<DrawerXs />
								</body>
							</DrawerXsStateProvider>
						</ScrollDirectionClassNameSetter>
					</ScrollKeeperProvider>
				</QueryClientProvider>
			</PreferencesProvider>

			<Analytics />
		</html>
	);
}
