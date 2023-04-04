import { ReactNode } from 'react';
import { Noto_Sans as NotoSans } from 'next/font/google';
import './globals.css'
import { NextSeo } from 'next-seo';
import styles from './layout.module.css'
import { QueryClientProvider } from '@/components/QueryClientProvider';
import { ScrollKeeperProvider } from '@/components/ScrollKepeerProvider';

const notoSans = NotoSans({
	weight: ['400', '700'],
	subsets: ['latin'],
	display: 'swap',
});

export default function RootLayout({
	children
}: {
	children: ReactNode;
}) {
	return (
		<html className={notoSans.className}>
			<head>
				<NextSeo
					useAppDir
					titleTemplate="%s | Nostter"
					openGraph={{
						siteName: 'Nostter',
					}}
				/>
			</head>

			<body className={styles.body}>
				<QueryClientProvider>
					<ScrollKeeperProvider>
						<header className={styles.header}>
							{/* TODO: header */}
						</header>

						<main className={styles.main}>
							<section className={styles.section}>
								<div className={styles.content}>
									{children}
								</div>
							</section>

							<aside className={styles.aside}>
								{/* TODO: aside */}
							</aside>
						</main>
					</ScrollKeeperProvider>
				</QueryClientProvider>
			</body>
		</html>
	);
}
