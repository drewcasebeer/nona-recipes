import { RecipeCard } from "@/components/recipe-card";
import { RecipeGetMany } from "../../types";

interface Props {
	recipes: RecipeGetMany['items'];
}

export const RecipeList = ({ recipes }: Props) => {
	return (
		<div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{recipes.map(recipe => (
				<RecipeCard
					key={recipe.id}
					recipe={recipe}
				/>
			))}
		</div>
	);
};