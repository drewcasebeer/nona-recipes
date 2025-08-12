
"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { trpc } from "@/trpc/client";
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

interface Props {
	recipeId: string;
}

export const RecipeIdView = ({ recipeId }: Props) => {
	const { data, isLoading, error } = trpc.recipes.getOne.useQuery({ id: recipeId });

	if (isLoading) return <RecipeIdViewLoading />;
	if (error || !data) return <RecipeIdViewError />;

	return (
		<div className="mx-auto max-w-6xl px-4 py-6">
			{/* Breadcrumbs */}
			<nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
				<ol className="flex items-center gap-2">
					<li>
						<Link href="/" className="hover:text-foreground">Home</Link>
					</li>
					<li aria-hidden="true" className="select-none"> / </li>
					<li>
						<Link href="/#featured" className="hover:text-foreground">Recipes</Link>
					</li>
					<li aria-hidden="true" className="select-none"> / </li>
					<li className="text-foreground" aria-current="page">{data.title}</li>
				</ol>
			</nav>

			{/* Header */}
			<header className="mt-4">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{data.title}</h1>
						<p className="mt-2 max-w-prose text-muted-foreground">{data.description}</p>
						<div className="mt-3 flex flex-wrap items-center gap-2">
							<Badge variant="secondary">{data.difficulty}</Badge>
							{data.cuisine ? <Badge variant="secondary">{data.cuisine}</Badge> : null}
							{Array.isArray(data.tags) && data.tags.map(t => (
								<Badge key={t} variant="outline" className="rounded-full">{t}</Badge>
							))}
						</div>
					</div>
					<div className="flex items-center gap-2">
						<RecipeActions title={data.title} id={data.id} />
					</div>
				</div>

				<div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
					<div className="flex items-center gap-2">
						<Star className="h-4 w-4 fill-amber-500 text-amber-500" />
						<span className="font-medium">{typeof data.rating === "number" ? (data.rating as number).toFixed(1) : data.rating}</span>
						<span className="text-muted-foreground">rating</span>
					</div>
					<Separator orientation="vertical" className="hidden h-4 sm:block" />
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4" />
						<span>{data.time}</span>
					</div>
					<Separator orientation="vertical" className="hidden h-4 sm:block" />
					<div className="flex items-center gap-2">
						<ChefHat className="h-4 w-4" />
						<span>By {data.author}</span>
					</div>
				</div>
			</header>

			{/* Hero image */}
			<div className="mt-6 overflow-hidden rounded-xl">
				<Image
					src={data.image || "/placeholder.svg"}
					alt={`${data.title} photo`}
					width={640}
					height={360}
					className="mx-auto object-cover"
					priority
				/>
			</div>

			{/* Content grid */}
			<section className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
				{/* Left: Ingredients + Steps */}
				<div className="space-y-8">
					{/* Ingredients */}
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold">Ingredients</h2>
								<div className="text-xs text-muted-foreground">Servings: {data.servings}</div>
							</div>
							<IngredientChecklist items={data.ingredients} />
						</CardContent>
					</Card>

					{/* Steps */}
					<Card>
						<CardContent className="p-6">
							<h2 className="mb-2 text-xl font-semibold">Instructions</h2>
							<StepList steps={data.steps} />
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
	);
};

export const RecipeIdViewLoading = () => {
	return <LoadingState title="Loading Recipe" description="This may take a few seconds" />;
};

export const RecipeIdViewError = () => {
	return <ErrorState title="Failed Loading Recipe" description="Something went wrong" />;
};
