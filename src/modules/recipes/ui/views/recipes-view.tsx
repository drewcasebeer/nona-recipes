"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/empty-state";
import { useRecipesFilters } from "../../hooks/use-recipes-filters";
import { DataPagination } from "../components/data-pagination";
import { RecipeList } from "../components/recipe-list";

export const RecipesView = () => {
	const [filters, setFilters] = useRecipesFilters();

	const trpc = useTRPC();
	const { data } = useSuspenseQuery(
		trpc.recipes.getMany.queryOptions({
			...filters,
		})
	);

	return (
		<div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
			<RecipeList recipes={data.items} />
			<DataPagination page={filters.page} totalPages={data.totalPages} onPageChange={page => setFilters({ page })} />

			{data.items.length === 0 && (
				<EmptyState
					title="Create your first recipe"
					description="You don't have any recipes yet. Click the button below to create one."
				/>
			)}
		</div>
	);
};

export const RecipesViewLoading = () => {
	return <LoadingState title="Loading Recipes" description="This may take a few seconds" />;
};

export const RecipesViewError = () => {
	return <ErrorState title="Failed Loading Recipes" description="Something went wrong" />;
};
