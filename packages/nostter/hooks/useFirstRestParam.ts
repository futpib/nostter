import { useParams } from "next/navigation";

export function useFirstRestParam() {
	const { rest: restParams } = useParams() ?? {};

	if (typeof restParams === "string") {
		return restParams;
	}

	if (Array.isArray(restParams)) {
		return (restParams as string[]).at(0);
	}

	return undefined;
}
