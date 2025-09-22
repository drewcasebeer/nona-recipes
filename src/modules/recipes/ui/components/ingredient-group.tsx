import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipeGetOneWithDetails } from "../../types";
import { IngredientChecklist } from "./ingredient-checklist";

interface Props {
	ingredientGroup: RecipeGetOneWithDetails["ingredientGroups"][0];
}

export function IngredientGroup({ ingredientGroup }: Props) {
	return (
		<Card className="border-none">
			<CardHeader>
				<CardTitle className="text-lg font-medium text-foreground">{ingredientGroup.name ?? "Ingredients"}</CardTitle>
			</CardHeader>

			<CardContent>
				<IngredientChecklist ingredients={ingredientGroup.ingredients} />
			</CardContent>
		</Card>
	);
}