'use client';

import { useAccounts } from '@/hooks/useAccounts';
import { usePubkeyMetadatasLoader } from '@/hooks/usePubkeyMetadatasLoader';
import { offset, shift, useClick, useDismiss, useFloating, useInteractions } from '@floating-ui/react';
import { useCallback, useState } from 'react';
import { FaEllipsisH } from 'react-icons/fa';
import { HeaderAccountButtonContent } from './HeaderAccountButtonContent';
import styles from './HeaderAccountButton.module.css';
import { HeaderAccountButtonTooltipContent } from './HeaderAccountButtonTooltipContent';

export function HeaderAccountButton() {
	const { accounts, primaryAccount, isAccountsInitialLoading } = useAccounts();

	const {
		pubkeyMetadatas,
	} = usePubkeyMetadatasLoader({
		profilePointers: primaryAccount ? [
			{
				pubkey: primaryAccount.pubkey,
			},
		] : [],
	});

	const primaryAccountPubkeyMetadata = primaryAccount ? pubkeyMetadatas.get(primaryAccount.pubkey) : undefined;

	const [ isTooltipOpen, setIsTooltipOpen ] = useState(false);

	const { x, y, strategy, refs, context, update } = useFloating({
		open: isTooltipOpen,
		onOpenChange: setIsTooltipOpen,
		placement: 'top',
		middleware: [ shift(), offset(16) ],
	});

	const click = useClick(context);
	const dismiss = useDismiss(context);

	const { getReferenceProps, getFloatingProps } = useInteractions([
		click,
		dismiss,
	]);

	const handleTooltipClick = useCallback(() => {
		setTimeout(() => {
			setIsTooltipOpen(false);
		}, 0);
	}, []);

	return (isAccountsInitialLoading || !accounts.length) ? null : (
		<>
			<div
				ref={refs.setReference}
				className={styles.headerAccountButton}
				{...getReferenceProps()}
			>
				<div
					className={styles.headerAccountButtonContent}
				>
					{primaryAccount && (
						<HeaderAccountButtonContent
							pubkey={primaryAccount.pubkey}
							pubkeyMetadata={primaryAccountPubkeyMetadata}
						/>
					)}
				</div>

				<FaEllipsisH
					className={styles.ellipsis}
				/>
			</div>

			{isTooltipOpen && (
				<div
					ref={refs.setFloating}
					style={{
						position: strategy,
						top: y ?? 0,
						left: x ?? 0,
					}}
					className={styles.headerAccountButtonTooltip}
					onClick={handleTooltipClick}
					{...getFloatingProps()}
				>
					<HeaderAccountButtonTooltipContent
						ref={update}
					/>
				</div>
			)}
		</>
	);
}
