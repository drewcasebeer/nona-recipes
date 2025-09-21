"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, XCircle } from "lucide-react";
import { NewRecipeDialog } from "./new-recipe-dialog";
import { useState } from "react";
import { useRecipesFilters } from "../../hooks/use-recipes-filters";
import { RecipesSearchFilter } from "./recipe-search-filter";
import { DEFAULT_PAGE } from "@/constants";

export const RecipeListHeader = () => {
	const [filters, setFilters] = useRecipesFilters();
	const [isDialogOpen, setDialogOpen] = useState(false);

	const isAnyFilterModified = !!filters.search;

	const onClearFilters = () => {
		setFilters({
			search: "",
			page: DEFAULT_PAGE,
		});
	};

	return (
		<>
			<NewRecipeDialog open={isDialogOpen} onOpenChange={setDialogOpen} />
			<div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
				<div className="flex items-center justify-between">
					<h5 className="font-medium text-xl">My Recipes</h5>

					<Button onClick={() => setDialogOpen(true)}>
						<PlusIcon />
						New Recipe
					</Button>
				</div>

				<div className="flex items-center gap-x-2 p-1">
					<RecipesSearchFilter />
					{isAnyFilterModified && (
						<Button variant="outline" size="sm" onClick={onClearFilters}>
							<XCircle />
							Clear
						</Button>
					)}
				</div>
			</div>
		</>
	);
};
