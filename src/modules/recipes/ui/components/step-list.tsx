"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

type Props = {
	steps?: string[];
};

export function StepList({
	steps = [
		"Example step one with a clear instruction.",
		"Example step two to show the UI.",
		"Example step three to finish.",
	],
}: Props) {
	const [done, setDone] = useState<Set<number>>(new Set());

	return (
		<ol className="mt-2 space-y-3">
			{steps.map((step, idx) => {
				const isDone = done.has(idx);
				return (
					<li key={idx} className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/50">
						<button
							type="button"
							aria-pressed={isDone}
							aria-label={isDone ? "Mark step as not completed" : "Mark step as completed"}
							onClick={() => {
								const next = new Set(done);
								if (next.has(idx)) next.delete(idx);
								else next.add(idx);
								setDone(next);
							}}
							className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
								isDone ? "border-amber-600 bg-amber-600 text-white" : "border-muted-foreground/30"
							}`}
						>
							{isDone ? <CheckCircle2 className="h-4 w-4" /> : <span className="sr-only">Toggle</span>}
						</button>
						<p className={`text-sm ${isDone ? "text-muted-foreground line-through" : ""}`}>
							<span className="font-medium">Step {idx + 1}.</span> {step}
						</p>
					</li>
				);
			})}
		</ol>
	);
}
