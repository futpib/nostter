import { ComponentProps, MouseEvent, useCallback } from "react";
import { Note } from "./Note";
import { ParentNote } from "./ParentNote";
import { EmbeddedNote } from "./EmbeddedNote";
import { ChildNote } from "./ChildNote";
import { useRouter } from "next/navigation";
import { TimelineNote } from "./TimelineNote";

const components = {
	Note,
	ParentNote,
	EmbeddedNote,
	ChildNote,
	TimelineNote,
};

type ComponentKey = keyof typeof components;

export function NoteLink<K extends ComponentKey>({
	href,
	componentKey,
	...props
}: {
	href: string;
	componentKey: K;
} & ComponentProps<(typeof components)[K]>) {
	const Component: any = components[componentKey];

	const router = useRouter();

	const handleClick = useCallback((event: MouseEvent) => {
		event.stopPropagation();

		router.push(href);
	}, [ router, href ]);

	const handleAuxClick = useCallback((event: MouseEvent) => {
		if (event.button !== 1) {
			return;
		}

		event.stopPropagation();

		const newTabWindow = window.open(href, "_blank");
		newTabWindow?.blur();
	}, [ router, href ]);

	return (
		<Component
			{...props}
			onClick={handleClick}
			onAuxClick={handleAuxClick}
		/>
	);
}
