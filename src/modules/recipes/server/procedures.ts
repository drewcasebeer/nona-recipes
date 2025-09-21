import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { recipes, recipeRatings, ingredientGroups, ingredients, recipeSteps, user } from "@/db/schema";
import { db } from "@/db";
import { z } from "zod";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
	recipesInsertSchema,
	recipesUpdateSchema,
	recipeWithDetailsInsertSchema,
	recipeWithDetailsUpdateSchema,
} from "../schemas";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { nanoid } from "nanoid";

// NOTE: You will need to implement the actual AI parsing logic.
// This is a placeholder function to simulate the process.
const parseImageWithAI = async (imageData: string): Promise<z.infer<typeof recipeWithDetailsInsertSchema>> => {
	// ----------------------------------------------------
	// YOUR AI INTEGRATION CODE HERE
	// This function would call an external AI service (e.g., OpenAI Vision, Google Cloud Vision, etc.)
	// with the image data and prompt it to return a JSON object that matches your schema.
	// ----------------------------------------------------

	// Example: Simulate a successful response
	const mockResponse = {
		title: "AI-Parsed Chicken Noodle Soup",
		description: "A delicious soup parsed from an image.",
		servings: 4,
		time: 45,
		heroImage: "https://your-image-service.com/ai-parsed-image.jpg",
		ingredientGroups: [
			{
				name: "Soup",
				sortOrder: 0,
				ingredients: [
					{ description: "1 tbsp olive oil" },
					{ description: "1 onion, chopped" },
					{ description: "2 carrots, sliced" },
					{ description: "2 celery stalks, sliced" },
					{ description: "8 cups chicken broth" },
					{ description: "2 cups cooked chicken, shredded" },
				],
			},
			{
				name: "Noodles",
				sortOrder: 1,
				ingredients: [{ description: "8 oz egg noodles" }],
			},
		],
		steps: [
			{ description: "Heat olive oil in a large pot.", sortOrder: 0 },
			{ description: "Add onion, carrots, and celery and cook until softened.", sortOrder: 1 },
			{ description: "Pour in chicken broth and bring to a boil. Add chicken and noodles.", sortOrder: 2 },
			{ description: "Cook until noodles are tender. Serve hot.", sortOrder: 3 },
		],
	};

	// Use your zod schema to validate the data returned by the AI.
	// This step is crucial for data integrity and type safety.
	const result = recipeWithDetailsInsertSchema.safeParse(mockResponse);

	if (!result.success) {
		console.error("AI returned invalid data:", result.error);
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "The AI failed to produce a valid recipe. Please try a different image or enter the recipe manually.",
		});
	}

	return result.data;
};

export const recipesRouter = createTRPCRouter({
	// -----------------------
	// Queries
	// -----------------------
	getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
		const ratingsSub = db
			.select({
				recipeId: recipeRatings.recipeId,
				rating: sql<number>`CAST(avg(${recipeRatings.rating}) AS FLOAT)`.as("rating"),
			})
			.from(recipeRatings)
			.groupBy(recipeRatings.recipeId)
			.as("ratings");

		const [existingRecipe] = await db
			.select({
				...getTableColumns(recipes),
				rating: sql<number>`COALESCE(${ratingsSub.rating}, 0)`.as("rating"),
				author: sql<string>`${user.name}`.as("author"),
			})
			.from(recipes)
			.leftJoin(ratingsSub, eq(ratingsSub.recipeId, recipes.id))
			.leftJoin(user, eq(user.id, recipes.userId))
			.where(eq(recipes.id, input.id));

		if (!existingRecipe) {
			throw new TRPCError({ code: "NOT_FOUND", message: `Recipe not found` });
		}

		return existingRecipe;
	}),

	getOneWithDetails: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
		const ratingsSub = db
			.select({
				recipeId: recipeRatings.recipeId,
				rating: sql<number>`CAST(avg(${recipeRatings.rating}) AS FLOAT)`.as("rating"),
			})
			.from(recipeRatings)
			.groupBy(recipeRatings.recipeId)
			.as("ratings");

		const [recipe] = await db
			.select({
				...getTableColumns(recipes),
				rating: sql<number>`COALESCE(${ratingsSub.rating}, 0)`.as("rating"),
				author: sql<string>`${user.name}`.as("author"),
			})
			.from(recipes)
			.leftJoin(ratingsSub, eq(ratingsSub.recipeId, recipes.id))
			.leftJoin(user, eq(user.id, recipes.userId))
			.where(eq(recipes.id, input.id));

		if (!recipe) {
			throw new TRPCError({ code: "NOT_FOUND", message: `Recipe not found` });
		}

		const groups = await db
			.select()
			.from(ingredientGroups)
			.where(eq(ingredientGroups.recipeId, input.id))
			.orderBy(ingredientGroups.sortOrder);

		const groupIds = groups.map(g => g.id);
		const groupIngredients =
			groupIds.length > 0 ? await db.select().from(ingredients).where(eq(ingredients.groupId, groupIds[0])) : [];

		const steps = await db
			.select()
			.from(recipeSteps)
			.where(eq(recipeSteps.recipeId, input.id))
			.orderBy(recipeSteps.sortOrder);

		return {
			...recipe,
			ingredientGroups: groups.map(g => ({
				...g,
				ingredients: groupIngredients.filter(i => i.groupId === g.id),
			})),
			steps,
		};
	}),
	getMany: protectedProcedure
		.input(
			z.object({
				page: z.number().default(DEFAULT_PAGE),
				pageSize: z.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
				search: z.string().nullish(),
			})
		)
		.query(async ({ input }) => {
			const { page, pageSize, search } = input;

			const ratingsSub = db
				.select({
					recipeId: recipeRatings.recipeId,
					rating: sql<number>`CAST(avg(${recipeRatings.rating}) AS FLOAT)`.as("rating"),
				})
				.from(recipeRatings)
				.groupBy(recipeRatings.recipeId)
				.as("ratings");

			const data = await db
				.select({
					...getTableColumns(recipes),
					rating: sql<number>`COALESCE(${ratingsSub.rating}, 0)`.as("rating"),
					author: sql<string>`${user.name}`.as("author"),
				})
				.from(recipes)
				.leftJoin(ratingsSub, eq(ratingsSub.recipeId, recipes.id))
				.leftJoin(user, eq(user.id, recipes.userId))
				.where(search ? ilike(recipes.title, `%${search}%`) : undefined)
				.orderBy(desc(recipes.createdAt))
				.limit(pageSize)
				.offset((page - 1) * pageSize);

			const [total] = await db
				.select({ count: count() })
				.from(recipes)
				.where(search ? ilike(recipes.title, `%${search}%`) : undefined);

			return {
				items: data,
				total: total.count,
				totalPages: Math.ceil(total.count / pageSize),
			};
		}),
	getTopRated: protectedProcedure.input(z.object({ limit: z.number().min(1).max(100).default(10) }).nullish()).query(async ({ input }) => {
		const limit = input?.limit ?? 10;

		const ratingsSub = db
			.select({
				recipeId: recipeRatings.recipeId,
				rating: sql<number>`CAST(avg(${recipeRatings.rating}) AS FLOAT)`.as("rating"),
			})
			.from(recipeRatings)
			.groupBy(recipeRatings.recipeId)
			.as("ratings");

		const data = await db
			.select({
				...getTableColumns(recipes),
				rating: sql<number>`COALESCE(${ratingsSub.rating}, 0)`.as("rating"),
				author: sql<string>`${user.name}`.as("author"),
			})
			.from(recipes)
			.innerJoin(ratingsSub, eq(ratingsSub.recipeId, recipes.id))
			.leftJoin(user, eq(user.id, recipes.userId))
			.orderBy(desc(ratingsSub.rating))
			.limit(limit);

		return data;
	}),

	// -----------------------
	// Mutations (flat)
	// -----------------------
	create: protectedProcedure.input(recipesInsertSchema).mutation(async ({ input, ctx }) => {
		const [createdRecipe] = await db
			.insert(recipes)
			.values({
				...input,
				userId: ctx.auth.user.id,
			})
			.returning();

		return createdRecipe;
	}),

	update: protectedProcedure.input(recipesUpdateSchema).mutation(async ({ input, ctx }) => {
		const [updatedRecipe] = await db
			.update(recipes)
			.set(input)
			.where(and(eq(recipes.id, input.id), eq(recipes.userId, ctx.auth.user.id)))
			.returning();

		if (!updatedRecipe) {
			throw new TRPCError({ code: "NOT_FOUND", message: `Recipe not found` });
		}

		return updatedRecipe;
	}),

	remove: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
		const [deletedRecipe] = await db
			.delete(recipes)
			.where(and(eq(recipes.id, input.id), eq(recipes.userId, ctx.auth.user.id)))
			.returning();

		if (!deletedRecipe) {
			throw new TRPCError({ code: "NOT_FOUND", message: `Recipe not found` });
		}

		return deletedRecipe;
	}),

	// -----------------------
	// Mutations (with details)
	// -----------------------
	createWithDetails: protectedProcedure.input(recipeWithDetailsInsertSchema).mutation(async ({ input, ctx }) => {
		return await db.transaction(async tx => {
			// Destructure the input and rename the variables to avoid conflict with table names
			const { ingredientGroups: inputIngredientGroups, steps: inputSteps, ...recipeData } = input;

			const [recipe] = await tx
				.insert(recipes)
				.values({
					id: nanoid(),
					...recipeData,
					userId: ctx.auth.user.id,
				})
				.returning();

			for (const [gIndex, group] of inputIngredientGroups.entries()) {
				const [createdGroup] = await tx
					.insert(ingredientGroups)
					.values({
						id: nanoid(),
						recipeId: recipe.id,
						name: group.name,
						sortOrder: group.sortOrder ?? gIndex,
					})
					.returning();

				for (const ing of group.ingredients) {
					await tx.insert(ingredients).values({
						id: nanoid(),
						groupId: createdGroup.id,
						description: ing.description,
					});
				}
			}

			for (const [sIndex, step] of inputSteps.entries()) {
				await tx.insert(recipeSteps).values({
					id: nanoid(),
					recipeId: recipe.id,
					description: step.description,
					sortOrder: step.sortOrder ?? sIndex,
				});
			}

			return recipe;
		});
	}),

	updateWithDetails: protectedProcedure.input(recipeWithDetailsUpdateSchema).mutation(async ({ input, ctx }) => {
		return await db.transaction(async tx => {
			const [updatedRecipe] = await tx
				.update(recipes)
				.set({
					title: input.title,
					description: input.description,
					servings: input.servings,
					time: input.time,
					heroImage: input.heroImage,
					updatedAt: new Date(),
				})
				.where(and(eq(recipes.id, input.id), eq(recipes.userId, ctx.auth.user.id)))
				.returning();

			if (!updatedRecipe) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Recipe not found" });
			}

			// clear old steps & groups
			await tx.delete(recipeSteps).where(eq(recipeSteps.recipeId, input.id));
			const deletedGroups = await tx
				.delete(ingredientGroups)
				.where(eq(ingredientGroups.recipeId, input.id))
				.returning({ id: ingredientGroups.id });

			for (const g of deletedGroups) {
				await tx.delete(ingredients).where(eq(ingredients.groupId, g.id));
			}

			// re-insert groups & ingredients
			for (const [gIndex, group] of input.ingredientGroups.entries()) {
				const [newGroup] = await tx
					.insert(ingredientGroups)
					.values({
						id: nanoid(),
						recipeId: input.id,
						name: group.name,
						sortOrder: group.sortOrder ?? gIndex,
					})
					.returning();

				for (const ing of group.ingredients) {
					await tx.insert(ingredients).values({
						id: nanoid(),
						groupId: newGroup.id,
						description: ing.description,
					});
				}
			}

			// re-insert steps
			for (const [sIndex, step] of input.steps.entries()) {
				await tx.insert(recipeSteps).values({
					id: nanoid(),
					recipeId: input.id,
					description: step.description,
					sortOrder: step.sortOrder ?? sIndex,
				});
			}

			return updatedRecipe;
		});
	}),

	// -----------------------
	// New Procedure for AI Parsing
	// -----------------------
	parseImage: protectedProcedure
		.input(
			z.object({
				image: z.string(), // This would be a base64 string or a URL
			})
		)
		.output(recipeWithDetailsInsertSchema) // Ensure the output matches your schema
		.mutation(async ({ input }) => {
			try {
				const parsedData = await parseImageWithAI(input.image);
				return parsedData;
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "An unexpected error occurred during image parsing.",
				});
			}
		}),
});
