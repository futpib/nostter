'use client';

import { useDrawerXsState } from '@/hooks/useDrawerXsState';
import { useDismiss, useFloating, useInteractions, useMergeRefs } from '@floating-ui/react';
import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RemoveScroll } from 'react-remove-scroll';
import styles from './DrawerXs.module.css';
import { DrawerXsContent } from './DrawerXsContent';

export function DrawerXs() {
	const { isOpen, setIsOpen } = useDrawerXsState();
	const [ isTouching, setIsTouching ] = useState(false);

	const drawerRef = useRef<HTMLElement>(null);

	const { refs, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
	});

	const drawerMergedRefs = useMergeRefs([ drawerRef, refs.setFloating ]);

	const dismiss = useDismiss(context);

	const { getFloatingProps } = useInteractions([
		dismiss,
	]);

	const touchState = useMemo(() => ({
		startPosition: {
			x: 0,
			y: 0,
		},
		startedSwipe: false,
		drawerWidth: 280,
	}), []);

	useEffect(() => {
		const handleTouchStart = (event: TouchEvent) => {
			const touch = event.targetTouches[0];

			if (!drawerRef.current) {
				return;
			}

			if (
				isOpen
				|| (
					!isOpen
					&& touch.pageX < 24
				)
			) {
				touchState.startPosition.x = touch.pageX;
				touchState.startPosition.y = touch.pageY;
				touchState.drawerWidth = drawerRef.current.offsetWidth;
				touchState.startedSwipe = true;
				setIsTouching(true);
			}
		};

		const handleTouchMove = (event: TouchEvent) => {
			const touch = event.targetTouches[0];

			if (!drawerRef.current) {
				return;
			}

			if (
				touchState.startedSwipe
				&& isOpen
				&& touch.pageX < touchState.startPosition.x
			) {
				let position = Math.min(touch.pageX - (touchState.startPosition.x - touchState.drawerWidth), touchState.drawerWidth);
				drawerRef.current.style.transition = 'none';
				drawerRef.current.style.transform = `translate(${position}px, 0)`;
			} else if (
				touchState.startedSwipe
				&& !isOpen
				&& touch.pageX > touchState.startPosition.x
			) {
				let position = Math.min(touch.pageX - touchState.startPosition.x, touchState.drawerWidth)
				drawerRef.current.style.transition = 'none';
				drawerRef.current.style.transform = `translate(${position}px, 0)`;
			}
		};

		const handleTouchEnd = (event: TouchEvent) => {
			const touch = event.changedTouches[0];

			if (!drawerRef.current) {
				return;
			}

			if (
				touchState.startedSwipe
				&& touch.pageX <= touchState.drawerWidth / 2
			) {
				setIsOpen(false);
				touchState.startedSwipe = false;
				drawerRef.current.style.transition = '';
				drawerRef.current.style.transform = '';
			} else if (
				touchState.startedSwipe
				&& touch.pageX > touchState.drawerWidth / 2
			) {
				setIsOpen(true);
				touchState.startedSwipe = false;
				drawerRef.current.style.transition = '';
				drawerRef.current.style.transform = '';
			}

			setIsTouching(false);
		};

		document.addEventListener('touchstart', handleTouchStart);
		document.addEventListener('touchmove', handleTouchMove);
		document.addEventListener('touchend', handleTouchEnd);

		return () => {
			document.removeEventListener('touchstart', handleTouchStart);
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('touchend', handleTouchEnd);
		};
	}, [ isOpen ]);

	return (
		<RemoveScroll
			forwardProps
			ref={drawerMergedRefs}
			enabled={isTouching || isOpen}
		>
			<aside
				className={classNames(
					styles.drawerXs,
					isOpen && styles.drawerXsOpen
				)}
				data-test-name="DrawerXs"
				{...getFloatingProps()}
			>
				<DrawerXsContent />
			</aside>
		</RemoveScroll>
	);
}
