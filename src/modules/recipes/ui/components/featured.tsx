"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/empty-state";

import { RecipeCard } from "@/modules/recipes/ui/components/recipe-card";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";
import { useRouter } from "next/navigation";

export const Featured = () => {
	const trpc = useTRPC();
	const router = useRouter();
	const { data, isError, isLoading } = useQuery(
		trpc.recipes.getTopRated.queryOptions({})
	);

	if (isLoading) {
		return <LoadingState title="Loading Featured Recipes" description="This may take a few seconds" />;
	}

	if (isError) {
		return <ErrorState title="Failed Loading Featured Recipes" description="Something went wrong" />;
	}

	if (!data || data.length === 0) {
		return <EmptyState title="No Featured Recipes" description="There are no featured recipes available." />;
	}

	return (
		<section className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
			<div className="flex items-end justify-between">
				<div>
					<h2 className="text-2xl font-semibold">Featured recipes</h2>
					<p className="text-muted-foreground">Hand-picked dishes to inspire your next meal.</p>
				</div>
				<Button variant="outline" className="hidden sm:inline-flex bg-transparent">
					View all
				</Button>
			</div>

			<div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{data.map(recipe => (
					<RecipeCard key={recipe.id} recipe={recipe} />
				))}
			</div>

			<div className="mt-8 flex justify-center">
				<Button className="bg-primary hover:bg-primary/90" onClick={() => router.push('/recipes')}>
					<ChefHat className="mr-2 h-4 w-4" />
					Discover more
				</Button>
			</div>
		</section>
	);
};
