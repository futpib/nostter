import { TRPCRouter } from "@/trpc/router";
import { Operation, TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import invariant from "invariant";

export function switchLink<C extends string>({
	condition,
	cases,
}: {
	condition: (op: Operation) => C;
	cases: Record<C, TRPCLink<TRPCRouter>>;
}): TRPCLink<TRPCRouter> {
	return (runtime) => {
		return (props) => {
			const case_ = condition(props.op);
			const link = cases[case_];
			invariant(link, `No case for ${case_}`);

			return observable((observer) => {
				return link(runtime)(props).subscribe(observer);
			});
		};
	};
}

