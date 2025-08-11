import { RecipeCard } from "@/components/recipe-card";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";

type Ingredient = {
	item: string;
	amount: string;
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
		]
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
		]
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
		]
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
		]
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
		]
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
		]
	},
];

export const Featured = () => {
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
				{recipes.map(r => (
					<RecipeCard
						key={r.id}
						id={r.id}
						title={r.title}
						description={r.description}
						image={r.image}
						time={r.time}
						rating={r.rating}
						calories={r.calories}
						tags={r.tags}
						author={r.author}
					/>
				))}
			</div>

			<div className="mt-8 flex justify-center">
				<Button className="bg-primary hover:bg-primary/90">
					<ChefHat className="mr-2 h-4 w-4" />
					Discover more
				</Button>
			</div>
		</section>
	);
}