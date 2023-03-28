import { ReactNode } from 'react';
import './globals.css'
import { NextSeo } from 'next-seo';

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
			<body>{children}</body>
		</html>
	);
}
