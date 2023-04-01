import { ComponentProps, MouseEvent, useCallback } from "react";
import { Note } from "./Note";
import { ParentNote } from "./ParentNote";
import { EmbeddedNote } from "./EmbeddedNote";
import { ChildNote } from "./ChildNote";
import { useRouter } from "next/navigation";

const components = {
	Note,
	ParentNote,
	EmbeddedNote,
	ChildNote,
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

	const handleClick = useCallback(() => {
		router.push(href);
	}, [ router, href ]);

	const handleAuxClick = useCallback((event: MouseEvent) => {
		if (event.button !== 1) {
			return;
		}

		window.open(href, "_blank");
	}, [ router, href ]);

	return (
		<Component
			{...props}
			onClick={handleClick}
			onAuxClick={handleAuxClick}
		/>
	);
}
