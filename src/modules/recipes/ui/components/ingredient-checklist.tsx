"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type Ingredient = {
	item: string;
	amount: string;
};

type Props = {
	items?: Ingredient[];
};

export function IngredientChecklist({
	items = [
		{ item: "Sample ingredient", amount: "1 cup" },
		{ item: "Another ingredient", amount: "2 tbsp" },
	],
}: Props) {
	const [checked, setChecked] = useState<Set<number>>(new Set());

	return (
		<ul id="ingredients" className="mt-4 space-y-2">
			{items.map((ing, idx) => {
				const isChecked = checked.has(idx);
				return (
					<li key={`${ing.item}-${idx}`}>
						<label className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted/50">
							<input
								type="checkbox"
								className="mt-1 h-4 w-4 accent-amber-600"
								checked={isChecked}
								onChange={() => {
									const next = new Set(checked);
									if (next.has(idx)) next.delete(idx);
									else next.add(idx);
									setChecked(next);
								}}
								aria-label={`Mark ${ing.item} as collected`}
							/>
							<span className={isChecked ? "text-muted-foreground line-through" : ""}>
								<span className="font-medium">{ing.amount}</span> <span className="">{ing.item}</span>
							</span>
							{isChecked ? <Check className="ml-auto h-4 w-4 text-amber-600" /> : null}
						</label>
					</li>
				);
			})}
		</ul>
	);
}
