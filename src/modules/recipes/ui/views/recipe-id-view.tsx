"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Flame, Leaf, ListChecks, Pencil, Printer, Star, Trash } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { StepList } from "../components/step-list";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Breadcrumb, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { UpdateRecipeDialog } from "../components/update-recipe-dialog";
import { useState } from "react";
import { useConfirm } from "../../hooks/use-confirm";
import { convertTimeToString } from "@/lib/utils";
import { IngredientGroup } from "../components/ingredient-group";

interface Props {
	recipeId: string;
}

export const RecipeIdView = ({ recipeId }: Props) => {
	const trpc = useTRPC();
	const router = useRouter();
	const queryClient = useQueryClient();

	const [updateRecipeDialogOpen, setUpdateRecipeDialogOpen] = useState(false);

	const { data } = useSuspenseQuery(trpc.recipes.getOneWithDetails.queryOptions({ id: recipeId }));
	const { title, description, rating, author, heroImage, servings, ingredientGroups, steps } = data;
	const time = data.time ? convertTimeToString(data.time) : null;

	const removeRecipe = useMutation(
		trpc.recipes.remove.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.recipes.getMany.queryOptions({}));
				await queryClient.invalidateQueries(trpc.recipes.getOneWithDetails.queryOptions({ id: recipeId }));
				await queryClient.invalidateQueries(trpc.recipes.getOne.queryOptions({ id: recipeId }));
				router.push("/");
			},
			onError: error => {
				toast.error(error.message);
			}
		})
	);

	const [RemoveConfirmation, confirmRemove] = useConfirm(
		"Are you sure?",
		`The following action will remove the recipe: "${title}"`,
	);

	const handleRemoveRecipe = async () => {
		const ok = await confirmRemove();

		if (!ok) {
			return;
		}

		await removeRecipe.mutateAsync({ id: recipeId });
	};

	return (
		<>
			<RemoveConfirmation />
			<UpdateRecipeDialog open={updateRecipeDialogOpen} onOpenChange={setUpdateRecipeDialogOpen} initialValues={data} />

			<div className="mx-auto max-w-6xl px-4 py-6">
				{/* Breadcrumbs */}
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbLink href="/">Home</BreadcrumbLink>

						<BreadcrumbSeparator />

						<BreadcrumbLink href="/#featured">Recipes</BreadcrumbLink>

						<BreadcrumbSeparator />

						<BreadcrumbLink href={`/recipes/${recipeId}`}>{title}</BreadcrumbLink>
					</BreadcrumbList>
				</Breadcrumb>

				{/* Header */}
				<header className="mt-4">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
							<p className="mt-2 max-w-prose text-muted-foreground">{description}</p>
							{/* <div className="mt-3 flex flex-wrap items-center gap-2">
								<Badge variant="secondary">{difficulty}</Badge>
								{cuisine ? <Badge variant="secondary">{cuisine}</Badge> : null}
								{Array.isArray(tags) && tags.map(t => (
									<Badge key={t} variant="outline" className="rounded-full">{t}</Badge>
								))}
							</div> */}
						</div>
						<div className="flex items-center gap-2">
							<div className="flex items-center gap-2">
								{/* <Button
									variant={favorited ? "default" : "outline"}
									className={favorited ? "bg-primary hover:bg-primary/90" : ""}
									onClick={() => setFavorited(s => !s)}
									aria-pressed={favorited}
								>
									<Bookmark className="mr-2 h-4 w-4" />
									{favorited ? "Favorited" : "Favorite"}
								</Button> */}

								<Button variant="outline" onClick={() => window.print()}>
									<Printer className="mr-2 h-4 w-4" />
									Print
								</Button>

								<Button variant="outline" onClick={() => setUpdateRecipeDialogOpen(true)}>
									<Pencil className="mr-2 h-4 w-4" />
									Edit
								</Button>

								<Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600/10 focus:ring-red-600" onClick={handleRemoveRecipe} disabled={removeRecipe.isPending}>
									<Trash className="mr-2 h-4 w-4" />
									Delete
								</Button>
							</div>
						</div>
					</div>

					<div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
						<div className="flex items-center gap-2">
							<Star className="h-4 w-4 fill-amber-500 text-amber-500" />
							<span className="font-medium">{rating.toFixed(1)}</span>
							<span className="text-muted-foreground">rating</span>
						</div>
						<Separator orientation="vertical" className="hidden h-4 sm:block" />
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4" />
							<span>{time}</span>
						</div>
						<Separator orientation="vertical" className="hidden h-4 sm:block" />
						<div className="flex items-center gap-2">
							<ChefHat className="h-4 w-4" />
							<span>By: {author}</span>
						</div>
					</div>
				</header>

				{/* Hero image */}
				<div className="mt-6 overflow-hidden rounded-xl">
					<img
						src={heroImage || "/placeholder.png"}
						alt={`${title} photo`}
						width={640}
						height={360}
						className="mx-auto object-cover"
					/>
				</div>

				{/* Content grid */}
				<section className="mt-8">
					{/* Left: Ingredients + Steps */}
					<div className="space-y-8">
						{/* Ingredients */}
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<h2 className="text-xl font-semibold">Ingredients</h2>
									<div className="text-xs text-muted-foreground">Servings: {servings}</div>
								</div>
								
								{ingredientGroups.map(ingredientGroup => <IngredientGroup key={ingredientGroup.id} ingredientGroup={ingredientGroup} />)}
							</CardContent>
						</Card>

						{/* Steps */}
						<Card>
							<CardContent className="p-6">
								<h2 className="mb-2 text-xl font-semibold">Instructions</h2>
								<StepList steps={steps} />
								<div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
									<Leaf className="h-4 w-4" />
									<span>Tip: Read through all steps before starting.</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</section>

				{/* Back link */}
				<div className="mt-10">
					<Button variant="ghost" asChild>
						<Link href="/">{"←"} Back to home</Link>
					</Button>
				</div>
			</div>
		</>
	);
};

export const RecipeIdViewLoading = () => {
	return <LoadingState title="Loading Recipe" description="This may take a few seconds" />;
};

export const RecipeIdViewError = () => {
	return <ErrorState title="Failed Loading Recipe" description="Something went wrong" />;
};
