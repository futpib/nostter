export function isElementVisible(element: HTMLElement): boolean {
	const { top, bottom } = element.getBoundingClientRect();
	return (top >= 0) && (bottom <= window.innerHeight);
}
