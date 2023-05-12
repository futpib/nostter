"use client";

import { ScrollStatus, useScrollSpy } from "@/hooks/useScrollSpy";
import { debugEnabled } from "@/utils/debugEnabled";
import classNames from "classnames";
import invariant from "invariant";
import React, { ReactNode, createContext, useMemo } from "react";
import { mergeRefs } from "react-merge-refs";
import styles from './ScrollSpyStatusProvider.module.css';

export type ScrollSpyStatusContextValue = {
	scrollStatus: undefined | ScrollStatus;
};

const defaultValue: ScrollSpyStatusContextValue = {
	scrollStatus: undefined,
};

export const ScrollSpyStatusContext = createContext<undefined | ScrollSpyStatusContextValue>(defaultValue);

export function ScrollSpyStatusProvider({
	children,
}: {
	children: ReactNode;
}) {
	const childrenLength = React.Children.count(children);

	invariant(
		childrenLength === 1,
		`ScrollSpyStatusProvider expects exactly one child, but found ${childrenLength}.`
	);

	const [ child ] = React.Children.toArray(children) as React.ReactElement[];

	const { ref, scrollStatus } = useScrollSpy();

	const value = useMemo(() => ({
		scrollStatus,
	}), [scrollStatus]);

	const childWithRef = React.cloneElement(child, {
		ref: mergeRefs([ (child as any).ref, ref ]),
		className: classNames(
			child.props.className,
			debugEnabled('components', 'ScrollSpyStatusProvider') && [
				scrollStatus === 'VISIBLE' && styles.debugScrollStatusVisible,
				scrollStatus === 'OVERSCAN' && styles.debugScrollStatusOverscan,
				scrollStatus === 'HIDDEN' && styles.debugScrollStatusHidden,
				scrollStatus === undefined && styles.debugScrollStatusUndefined,
			],
		),
	});

	return (
		<ScrollSpyStatusContext.Provider value={value}>
			{childWithRef}
		</ScrollSpyStatusContext.Provider>
	);
}
