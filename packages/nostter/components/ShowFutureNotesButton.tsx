import { useVisibility } from "@/hooks/useVisibility";
import classNames from "classnames";
import { ReactNode } from "react";
import { FaArrowUp } from "react-icons/fa";
import styles from "./ShowFutureNotesButton.module.css";

export function ShowFutureNotesButton({
	visible,
	onClick,
	pillChildren,
	buttonChildren,
}: {
	visible: boolean;
	onClick: () => void;
	pillChildren: ReactNode;
	buttonChildren: ReactNode;
}) {
	const {
		ref: showFutureNotesButtonRef,
		isVisible: showFutureNotesButtonVisible,
	} = useVisibility();

	const handleShowFutureNotesClick = () => {
		onClick();
	};

	const handleShowFutureNotesPillClick = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});

		handleShowFutureNotesClick();
	};

	return (
		<>
			<div
				className={classNames(
					styles.newNotes,
					showFutureNotesButtonVisible === false && visible && styles.newNotesVisible,
				)}
			>
				<div
					className={styles.newNotesPill}
					onClick={handleShowFutureNotesPillClick}
				>
					<FaArrowUp />
					<div>
						{pillChildren}
					</div>
				</div>
			</div>

			<div
				ref={showFutureNotesButtonRef}
				className={classNames(
					styles.newNotesButton,
					visible && styles.newNotesButtonVisible,
				)}
				onClick={handleShowFutureNotesClick}
			>
				{buttonChildren}
			</div>
		</>
	);
}
