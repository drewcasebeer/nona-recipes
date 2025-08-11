
"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { trpc } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Flame, Leaf, ListChecks, Star } from "lucide-react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecipeActions } from "../../components/recipe-actions";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { IngredientChecklist } from "../../components/ingredient-checklist";
import { StepList } from "../../components/step-list";
import { useState } from "react";

interface Props {
	recipeId: string;
}

export const RecipeIdView = ({ recipeId }: Props) => {
	const { data, isLoading, error } = trpc.recipes.getRecipeById.useQuery({ id: recipeId });

	if (isLoading) return <RecipeIdViewLoading />;
	if (error || !data) return <RecipeIdViewError />;

	return (
		<div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
			<div className="bg-white rounded-lg border">
				<div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
					<div className="flex items-center gap-x-3">
						{/* You can use GeneratedAvatar if available */}
						<h2 className="text-2xl font-medium">{data.title}</h2>
						<RecipeActions title={data.title} id={data.id} />
					</div>
					<p className="text-neutral-800">{data.description}</p>
					<div>
						<strong>Ingredients:</strong>
						<IngredientChecklist items={data.ingredients} />
					</div>
					<div>
						<strong>Steps:</strong>
						<StepList steps={data.steps} />
					</div>
				</div>
			</div>
		</div>
	);
};

export const RecipeIdViewLoading = () => {
	return <LoadingState title="Loading Recipe" description="This may take a few seconds" />;
};

export const RecipeIdViewError = () => {
	return <ErrorState title="Failed Loading Recipe" description="Something went wrong" />;
};
