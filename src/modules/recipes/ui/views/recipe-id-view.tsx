"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
// import { useTRPC } from "@/trpc/client";
// import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
// import { RecipeIdViewHeader } from "../components/recipe-id-view-header";
// import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Flame, Leaf, ListChecks, Star } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { useConfirm } from "@/hooks/use-confirm";
// import { useState } from "react";
// import { UpdateRecipeDialog } from "../components/update-recipe-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecipeActions } from "../../components/recie-actions";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { IngredientChecklist } from "../../components/ingredient-checklist";
import { StepList } from "../../components/step-list";

interface Props {
	recipeId: string;
}

type Ingredient = {
	item: string;
	amount: string;
};

type Nutrition = {
	calories: number;
	protein: string;
	fat: string;
	carbs: string;
	fiber?: string;
	sugar?: string;
};

type RecipeDetail = {
	id: string;
	title: string;
	description: string;
	image: string;
	time: string;
	rating: number;
	calories: number;
	tags: string[];
	author: string;
	servings: number;
	difficulty: "Easy" | "Medium" | "Hard";
	cuisine?: string;
	ingredients: Ingredient[];
	steps: string[];
	nutrition: Nutrition;
};

const recipes: RecipeDetail[] = [
	{
		id: "1",
		title: "Creamy Garlic Mushroom Pasta",
		description:
			"Silky garlic cream sauce tossed with sautéed mushrooms and fresh tagliatelle. Finished with parmesan and parsley.",
		image: "/creamy-garlic-mushroom-pasta.png",
		time: "25 min",
		rating: 4.8,
		calories: 520,
		tags: ["Vegetarian", "Quick"],
		author: "Jamie Brooks",
		servings: 2,
		difficulty: "Easy",
		cuisine: "Italian",
		ingredients: [
			{ item: "Tagliatelle (or fettuccine)", amount: "200 g" },
			{ item: "Cremini mushrooms, sliced", amount: "250 g" },
			{ item: "Garlic, minced", amount: "3 cloves" },
			{ item: "Heavy cream", amount: "200 ml" },
			{ item: "Parmesan, grated", amount: "40 g" },
			{ item: "Butter", amount: "1 tbsp" },
			{ item: "Olive oil", amount: "1 tbsp" },
			{ item: "Fresh parsley, chopped", amount: "2 tbsp" },
			{ item: "Salt & black pepper", amount: "to taste" },
		],
		steps: [
			"Cook pasta in salted boiling water until al dente. Reserve 1/2 cup pasta water.",
			"Sauté mushrooms in olive oil and butter over medium-high heat until browned.",
			"Add garlic and cook 30 seconds until fragrant.",
			"Pour in cream and simmer 2–3 minutes. Stir in half the parmesan.",
			"Toss in pasta, add a splash of pasta water to loosen, and season to taste.",
			"Serve topped with remaining parmesan and parsley.",
		],
		nutrition: {
			calories: 520,
			protein: "17 g",
			fat: "22 g",
			carbs: "64 g",
			fiber: "4 g",
			sugar: "5 g",
		},
	},
	{
		id: "2",
		title: "Citrus Herb Roasted Chicken",
		description:
			"Juicy whole roasted chicken with lemon, thyme, and roasted vegetables for a comforting family dinner.",
		image: "/roasted-lemon-herb-chicken.png",
		time: "1 hr 15 min",
		rating: 4.9,
		calories: 640,
		tags: ["Dinner", "Family"],
		author: "Ava Martinez",
		servings: 4,
		difficulty: "Medium",
		cuisine: "American",
		ingredients: [
			{ item: "Whole chicken", amount: "1.6 kg" },
			{ item: "Lemon, halved", amount: "1" },
			{ item: "Fresh thyme", amount: "6 sprigs" },
			{ item: "Carrots, chunks", amount: "3" },
			{ item: "Red onion, wedges", amount: "1" },
			{ item: "Olive oil", amount: "2 tbsp" },
			{ item: "Salt & black pepper", amount: "to taste" },
		],
		steps: [
			"Preheat oven to 220°C / 425°F.",
			"Pat chicken dry, season inside and out with salt and pepper. Stuff cavity with lemon and thyme.",
			"Toss vegetables with olive oil, salt, and pepper; place in roasting pan.",
			"Set chicken on top and roast 60–75 minutes until juices run clear or 75°C/165°F at the thigh.",
			"Rest 10 minutes, carve, and serve with the roasted vegetables.",
		],
		nutrition: {
			calories: 640,
			protein: "48 g",
			fat: "38 g",
			carbs: "20 g",
			fiber: "4 g",
			sugar: "8 g",
		},
	},
	{
		id: "3",
		title: "Spicy Tuna Poke Bowl",
		description:
			"Fresh ahi tuna with sriracha mayo, avocado, cucumber, and sesame over warm rice. Bright, fresh, and satisfying.",
		image: "/spicy-tuna-poke-bowl.png",
		time: "20 min",
		rating: 4.7,
		calories: 480,
		tags: ["Gluten-Free", "Fresh"],
		author: "Kenji Ito",
		servings: 2,
		difficulty: "Easy",
		cuisine: "Hawaiian",
		ingredients: [
			{ item: "Sushi-grade ahi tuna, cubed", amount: "250 g" },
			{ item: "Cooked sushi rice", amount: "2 cups" },
			{ item: "Avocado, diced", amount: "1" },
			{ item: "Cucumber, sliced", amount: "1/2" },
			{ item: "Scallions, sliced", amount: "2" },
			{ item: "Mayonnaise", amount: "2 tbsp" },
			{ item: "Sriracha", amount: "1–2 tsp" },
			{ item: "Soy sauce or tamari", amount: "1 tbsp" },
			{ item: "Sesame oil", amount: "1 tsp" },
			{ item: "Sesame seeds", amount: "1 tsp" },
		],
		steps: [
			"Whisk mayo with sriracha to make spicy mayo.",
			"Toss tuna with soy, sesame oil, and half the spicy mayo.",
			"Assemble bowls with rice, tuna, avocado, cucumber, and scallions.",
			"Drizzle remaining spicy mayo and sprinkle sesame seeds.",
		],
		nutrition: {
			calories: 480,
			protein: "28 g",
			fat: "16 g",
			carbs: "56 g",
			fiber: "6 g",
			sugar: "6 g",
		},
	},
	{
		id: "4",
		title: "Avocado Toast with Poached Egg",
		description: "Sourdough toast topped with smashed avocado, chili flakes, and a perfectly runny poached egg.",
		image: "/avocado-toast-poached-egg-chili.png",
		time: "10 min",
		rating: 4.6,
		calories: 350,
		tags: ["Breakfast", "Easy"],
		author: "Sofia Nguyen",
		servings: 1,
		difficulty: "Easy",
		cuisine: "Fusion",
		ingredients: [
			{ item: "Sourdough bread, sliced", amount: "1–2 slices" },
			{ item: "Ripe avocado", amount: "1/2" },
			{ item: "Egg", amount: "1" },
			{ item: "Chili flakes", amount: "Pinch" },
			{ item: "Lemon juice", amount: "1 tsp" },
			{ item: "Salt & black pepper", amount: "to taste" },
		],
		steps: [
			"Toast bread to your liking.",
			"Mash avocado with lemon juice, salt, and pepper.",
			"Poach egg 3–4 minutes for a runny yolk.",
			"Spread avocado on toast, top with egg, and sprinkle chili flakes.",
		],
		nutrition: {
			calories: 350,
			protein: "12 g",
			fat: "21 g",
			carbs: "28 g",
			fiber: "7 g",
			sugar: "2 g",
		},
	},
	{
		id: "5",
		title: "Creamy Tomato Basil Soup",
		description: "Comforting soup made with ripe tomatoes, basil, and a hint of cream.",
		image: "/creamy-tomato-basil-soup.png",
		time: "35 min",
		rating: 4.5,
		calories: 300,
		tags: ["Vegetarian", "Soup"],
		author: "Marco Rossi",
		servings: 3,
		difficulty: "Easy",
		cuisine: "Italian",
		ingredients: [
			{ item: "Olive oil", amount: "1 tbsp" },
			{ item: "Onion, chopped", amount: "1/2" },
			{ item: "Garlic, minced", amount: "2 cloves" },
			{ item: "Canned crushed tomatoes", amount: "800 g" },
			{ item: "Vegetable broth", amount: "1 cup" },
			{ item: "Heavy cream", amount: "1/3 cup" },
			{ item: "Fresh basil, torn", amount: "1/4 cup" },
			{ item: "Salt & black pepper", amount: "to taste" },
		],
		steps: [
			"Sauté onion in olive oil until translucent. Add garlic and cook 30 seconds.",
			"Add tomatoes and broth; simmer 15 minutes.",
			"Blend until smooth, stir in cream and basil, and season to taste.",
		],
		nutrition: {
			calories: 300,
			protein: "6 g",
			fat: "18 g",
			carbs: "30 g",
			fiber: "5 g",
			sugar: "12 g",
		},
	},
	{
		id: "6",
		title: "Mediterranean Quinoa Salad",
		description: "Quinoa with cucumber, olives, feta, and a bright lemony dressing.",
		image: "/placeholder.png",
		time: "25 min",
		rating: 4.4,
		calories: 420,
		tags: ["Healthy", "Vegetarian"],
		author: "Layla Haddad",
		servings: 4,
		difficulty: "Easy",
		cuisine: "Mediterranean",
		ingredients: [
			{ item: "Cooked quinoa", amount: "3 cups" },
			{ item: "Cucumber, diced", amount: "1" },
			{ item: "Cherry tomatoes, halved", amount: "1 cup" },
			{ item: "Kalamata olives, sliced", amount: "1/3 cup" },
			{ item: "Red onion, finely chopped", amount: "1/4" },
			{ item: "Feta cheese, crumbled", amount: "1/2 cup" },
			{ item: "Olive oil", amount: "3 tbsp" },
			{ item: "Lemon juice", amount: "2 tbsp" },
			{ item: "Dried oregano", amount: "1 tsp" },
			{ item: "Salt & black pepper", amount: "to taste" },
		],
		steps: [
			"Whisk olive oil, lemon juice, oregano, salt, and pepper to make dressing.",
			"Combine quinoa, cucumber, tomatoes, olives, red onion, and feta.",
			"Toss with dressing and adjust seasoning to taste.",
		],
		nutrition: {
			calories: 420,
			protein: "12 g",
			fat: "18 g",
			carbs: "52 g",
			fiber: "6 g",
			sugar: "6 g",
		},
	},
];
const recipe: RecipeDetail = recipes[0]; // For demonstration, using the first recipe

export const RecipeIdView = ({ recipeId }: Props) => {
	// const trpc = useTRPC();
	// const router = useRouter();
	// const queryClient = useQueryClient();

	// const [updateRecipeDialogOpen, setUpdateRecipeDialogOpen] = useState(false);

	// const { data } = useSuspenseQuery(trpc.recipes.getOne.queryOptions({ id: recipeId }));

	// const removeRecipe = useMutation(
	// 	trpc.recipes.remove.mutationOptions({
	// 		onSuccess: async () => {
	// 			await queryClient.invalidateQueries(trpc.recipes.getMany.queryOptions({}));
	// 			// Todo: Invalidate free tier usage
	// 			router.push("/recipes");
	// 		},
	// 		onError: error => {
	// 			toast.error(error.message);
	// 		},
	// 	})
	// );

	// const [RemoveConfirmation, confirmRemove] = useConfirm(
	// 	"Are you sure?",
	// 	`The following action will remove ${data.meetingCount} associated meetings`
	// );

	// const handleRemoveRecipe = async () => {
	// 	const ok = await confirmRemove();

	// 	if (!ok) {
	// 		return;
	// 	}

	// 	await removeRecipe.mutateAsync({ id: recipeId });
	// };

	return (
		// <>
		// 	<RemoveConfirmation />
		// 	<UpdateRecipeDialog open={updateRecipeDialogOpen} onOpenChange={setUpdateRecipeDialogOpen} initialValues={data} />
		// 	<div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
		// 		<RecipeIdViewHeader
		// 			recipeId={recipeId}
		// 			recipeName={data.name}
		// 			onEdit={() => setUpdateRecipeDialogOpen(true)}
		// 			onRemove={handleRemoveRecipe}
		// 		/>

		// 		<div className="bg-white rounded-lg border">
		// 			<div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
		// 				<div className="flex items-center gap-x-3">
		// 					<GeneratedAvatar variant="botttsNeutral" seed={data.name} className="size-10" />
		// 					<h2 className="text-2xl font-medium">{data.name}</h2>
		// 				</div>

		// 				<Badge variant="outline" className="flex items-center gap-x-2 [&>svg]:size-4">
		// 					<VideoIcon className="text-blue-700" />
		// 					{data.meetingCount} {data.meetingCount === 1 ? "Meeting" : "Meetings"}
		// 				</Badge>

		// 				<div className="flex flex-col gap-y-2">
		// 					<p className="text-md fond-medium">Instructions</p>
		// 					<p className="text-neutral-800">{data.instructions}</p>
		// 				</div>
		// 			</div>
		// 		</div>
		// 	</div>
		// </>

		<div className="mx-auto max-w-6xl px-4 py-6">
			{/* Breadcrumbs */}
			<nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
				<ol className="flex items-center gap-2">
					<li>
						<Link href="/" className="hover:text-foreground">
							Home
						</Link>
					</li>
					<li aria-hidden="true" className="select-none">
						{" / "}
					</li>
					<li>
						<Link href="/#featured" className="hover:text-foreground">
							Recipes
						</Link>
					</li>
					<li aria-hidden="true" className="select-none">
						{" / "}
					</li>
					<li className="text-foreground" aria-current="page">
						{recipe.title}
					</li>
				</ol>
			</nav>

			{/* Header */}
			<header className="mt-4">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{recipe.title}</h1>
						<p className="mt-2 max-w-prose text-muted-foreground">{recipe.description}</p>
						<div className="mt-3 flex flex-wrap items-center gap-2">
							<Badge variant="secondary">{recipe.difficulty}</Badge>
							{recipe.cuisine ? <Badge variant="secondary">{recipe.cuisine}</Badge> : null}
							{recipe.tags.map(t => (
								<Badge key={t} variant="outline" className="rounded-full">
									{t}
								</Badge>
							))}
						</div>
					</div>
					<div className="flex items-center gap-2">
						<RecipeActions title={recipe.title} id={recipe.id} />
					</div>
				</div>

				<div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
					<div className="flex items-center gap-2">
						<Star className="h-4 w-4 fill-amber-500 text-amber-500" />
						<span className="font-medium">{recipe.rating.toFixed(1)}</span>
						<span className="text-muted-foreground">rating</span>
					</div>
					<Separator orientation="vertical" className="hidden h-4 sm:block" />
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4" />
						<span>{recipe.time}</span>
					</div>
					<Separator orientation="vertical" className="hidden h-4 sm:block" />
					<div className="flex items-center gap-2">
						<Flame className="h-4 w-4 text-amber-600" />
						<span>{recipe.calories} kcal</span>
					</div>
					<Separator orientation="vertical" className="hidden h-4 sm:block" />
					<div className="flex items-center gap-2">
						<ChefHat className="h-4 w-4" />
						<span>By {recipe.author}</span>
					</div>
				</div>
			</header>

			{/* Hero image */}
			<div className="mt-6 overflow-hidden rounded-xl">
				<Image
					src={recipe.image || "/placeholder.svg"}
					alt={`${recipe.title} photo`}
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
								<div className="text-xs text-muted-foreground">Servings: {recipe.servings}</div>
							</div>
							<IngredientChecklist items={recipe.ingredients} />
						</CardContent>
					</Card>

					{/* Steps */}
					<Card>
						<CardContent className="p-6">
							<h2 className="mb-2 text-xl font-semibold">Instructions</h2>
							<StepList steps={recipe.steps} />
							<div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
								<Leaf className="h-4 w-4" />
								<span>Tip: Read through all steps before starting.</span>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right: Info */}
				<aside className="space-y-6 lg:sticky lg:top-16 self-start">
					<Card>
						<CardContent className="p-6">
							<h3 className="text-base font-semibold">Recipe info</h3>
							<div className="mt-4 grid grid-cols-2 gap-4 text-sm">
								<div>
									<div className="text-muted-foreground">Time</div>
									<div className="font-medium">{recipe.time}</div>
								</div>
								<div>
									<div className="text-muted-foreground">Difficulty</div>
									<div className="font-medium">{recipe.difficulty}</div>
								</div>
								<div>
									<div className="text-muted-foreground">Servings</div>
									<div className="font-medium">{recipe.servings}</div>
								</div>
								<div>
									<div className="text-muted-foreground">Calories</div>
									<div className="font-medium">{recipe.calories} kcal</div>
								</div>
							</div>
							<Separator className="my-4" />
							<h4 className="text-sm font-semibold">Nutrition (per serving)</h4>
							<div className="mt-2 grid grid-cols-2 gap-3 text-sm">
								<div>
									<div className="text-muted-foreground">Protein</div>
									<div className="font-medium">{recipe.nutrition.protein}</div>
								</div>
								<div>
									<div className="text-muted-foreground">Fat</div>
									<div className="font-medium">{recipe.nutrition.fat}</div>
								</div>
								<div>
									<div className="text-muted-foreground">Carbs</div>
									<div className="font-medium">{recipe.nutrition.carbs}</div>
								</div>
								{recipe.nutrition.fiber ? (
									<div>
										<div className="text-muted-foreground">Fiber</div>
										<div className="font-medium">{recipe.nutrition.fiber}</div>
									</div>
								) : null}
								{recipe.nutrition.sugar ? (
									<div>
										<div className="text-muted-foreground">Sugar</div>
										<div className="font-medium">{recipe.nutrition.sugar}</div>
									</div>
								) : null}
							</div>
							<Button asChild variant="outline" className="mt-6 w-full bg-transparent">
								<a href="#ingredients">
									<ListChecks className="mr-2 h-4 w-4" />
									Jump to ingredients
								</a>
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<h3 className="text-base font-semibold">More like this</h3>
							<div className="mt-3 flex flex-wrap gap-2">
								{recipes
									.filter(r => r.id !== recipe.id && r.tags.some(t => recipe.tags.includes(t)))
									.slice(0, 6)
									.map(r => (
										<Link key={r.id} href={`/recipes/${r.id}`} className="text-sm">
											<Badge variant="secondary" className="hover:bg-muted">
												{r.title.length > 22 ? `${r.title.slice(0, 22)}…` : r.title}
											</Badge>
										</Link>
									))}
							</div>
						</CardContent>
					</Card>
				</aside>
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
