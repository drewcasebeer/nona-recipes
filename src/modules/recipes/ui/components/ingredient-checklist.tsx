"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { RecipeGetOneWithDetails } from "../../types";

type Props = {
	ingredients: RecipeGetOneWithDetails["ingredientGroups"][0]["ingredients"];
};

export function IngredientChecklist({ ingredients }: Props) {
	const [checked, setChecked] = useState<Set<string>>(new Set());

	return (
		<ul className="mt-4 space-y-2">
			{ingredients.map((ingredient) => {
				const isChecked = checked.has(ingredient.id);

				return (
					<li key={ingredient.id}>
						<label className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted/50">
							<input
								type="checkbox"
								className="mt-1 h-4 w-4 accent-amber-600"
								checked={isChecked}
								onChange={() => {
									const next = new Set(checked);
									if (next.has(ingredient.id)) next.delete(ingredient.id);
									else next.add(ingredient.id);
									setChecked(next);
								}}
								aria-label={`Mark ${ingredient.description} as collected`}
							/>
							<span className={isChecked ? "text-muted-foreground line-through" : ""}>
								<span className="font-medium">{ingredient.description}</span>
							</span>
							{isChecked ? <Check className="ml-auto h-4 w-4 text-amber-600" /> : null}
						</label>
					</li>
				);
			})}
		</ul>
	);
}
