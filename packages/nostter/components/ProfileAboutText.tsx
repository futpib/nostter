import { ReactNode, useMemo } from 'react';
import Link from 'next/link';
import styles from './ProfileAboutText.module.css';
import { renderAboutContent } from '@/utils/renderAboutContent';
import classNames from 'classnames';

export function ProfileAboutText({
	className,
	content,
}: {
	className?: string;
	content: string;
}) {
	const { contentChildren } = useMemo(() => {
		return renderAboutContent<ReactNode>({
			content,
		}, {
			renderLink: ({ key, link }) => (
				<Link
					key={key}
					className={styles.link}
					href={link.href}
					target="_blank"
					rel="noopener noreferrer"
				>
					{link.value}
				</Link>
			),

			renderHashtag: ({ key, link }) => (
				<Link
					key={key}
					className={styles.link}
					href={`/search?q=${encodeURIComponent(link.href)}`}
				>
					{link.value}
				</Link>
			),
		});
	}, [content]);

	return contentChildren.length > 0 ? (
		<div
			className={classNames(styles.content, className)}
		>
			{contentChildren}
		</div>
	) : null;
}
