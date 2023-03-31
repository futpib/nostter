import { ReactNode } from 'react';
import './globals.css'
import { NextSeo } from 'next-seo';
import styles from './layout.module.css'
import { QueryClientProvider } from '@/components/QueryClientProvider';

export default function RootLayout({
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

			<body className={styles.body}>
				<QueryClientProvider>
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
				</QueryClientProvider>
			</body>
		</html>
	);
}
