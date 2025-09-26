import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { recipes, recipeRatings, ingredientGroups, ingredients, recipeSteps, user } from "@/db/schema";
import { db } from "@/db";
import { z } from "zod";
import { and, count, desc, eq, getTableColumns, ilike, inArray, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
	recipesInsertSchema,
	recipesUpdateSchema,
	recipeWithDetailsInsertSchema,
	recipeWithDetailsUpdateSchema,
} from "../schemas";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { nanoid } from "nanoid";
import { OpenAI } from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Hardcoded JSON Schema for recipeWithDetailsInsertSchema
const recipeResponseSchema = {
	type: "object",
	properties: {
		title: {
			type: "string",
			minLength: 1,
			description: "The title of the recipe"
		},
		description: {
			type: "string",
			description: "A brief description of the recipe"
		},
		servings: {
			type: "integer",
			minimum: 1,
			description: "Number of servings this recipe makes"
		},
		time: {
			type: "integer", 
			minimum: 0,
			description: "Total time in minutes to prepare and cook the recipe"
		},
		heroImage: {
			type: "string",
			description: "URL to the recipe image"
		},
		ingredientGroups: {
			type: "array",
			minItems: 1,
			items: {
				type: "object",
				properties: {
					name: {
						type: "string",
						description: "Name of the ingredient group (e.g., 'Main ingredients', 'For garnish')"
					},
					sortOrder: {
						type: "integer",
						minimum: 0,
						description: "Sort order for this group"
					},
					ingredients: {
						type: "array",
						minItems: 1,
						items: {
							type: "object",
							properties: {
								description: {
									type: "string",
									minLength: 1,
									description: "Full ingredient description with quantity and unit"
								}
							},
							required: ["description"],
							additionalProperties: false
						}
					}
				},
				required: ["name", "sortOrder", "ingredients"],
				additionalProperties: false
			}
		},
		steps: {
			type: "array",
			minItems: 1,
			items: {
				type: "object",
				properties: {
					description: {
						type: "string",
						minLength: 1,
						description: "Detailed step instruction"
					},
					sortOrder: {
						type: "integer",
						minimum: 0,
						description: "Sort order for this step"
					}
				},
				required: ["description", "sortOrder"],
				additionalProperties: false
			}
		}
	},
	required: ["title", "description", "servings", "time", "heroImage", "ingredientGroups", "steps"],
	additionalProperties: false
} as const;

// AI parsing function using OpenAI's GPT-4 Vision API with Structured Outputs
// Structured Outputs ensures the response always matches our schema, eliminating JSON parsing errors
const parseImageWithAI = async (imageData: string): Promise<z.infer<typeof recipeWithDetailsInsertSchema>> => {
	if (!process.env.OPENAI_API_KEY) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.",
		});
	}

	// Validate input
	if (!imageData || typeof imageData !== 'string') {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Invalid image data provided.",
		});
	}

	// Validate model
	const model = process.env.OPENAI_MODEL;
	if(!model) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "OpenAI model is not configured. Please set OPENAI_MODEL environment variable.",
		});
	}

	// Create the prompt for recipe extraction with structured outputs
	const prompt = `Analyze this recipe image and extract all recipe information. Your response will be automatically structured according to a predefined schema.

Instructions:
- Extract the recipe title, description, and any visible serving size or cooking time
- List all visible ingredients with their exact quantities and units
- Group ingredients logically if there are clear sections (e.g., "For sauce:", "For garnish:", etc.)
- If no grouping is apparent, use "Ingredients" as the group name
- Extract step-by-step cooking instructions in the correct order
- Provide realistic estimates for missing information (servings, time) based on the recipe type
- Be precise with measurements and clear with instructions
- Set sortOrder starting from 0 for both ingredient groups and steps

Focus on accuracy and completeness. Extract exactly what you see in the image.`;

	try {
		const response = await openai.responses.parse({
			model: model,
			input: [
				{
					role: "developer",
					content: prompt,
				},
				{
					role: "user",
					content: [
						{
							type: "input_image",
							detail: 'high',
							image_url: imageData, // This should be a data URL (data:image/jpeg;base64,...) or a public URL
						},
					],
				},
			],
			text: {
				format: {
					type: "json_schema",
					name: "recipeResponseSchema",
					strict: true,
					schema: recipeResponseSchema,
				},
			},
		});

		const content = response.output_parsed;
		if (!content) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "OpenAI returned an empty response.",
			});
		}

		// Transform the response to match our Zod schema (handle optional fields)
		// OpenAI's structured output ensures all required fields are present
		const rawContent = content as {
			title: string;
			description: string;
			servings: number;
			time: number;
			heroImage: string;
			ingredientGroups: Array<{
				name: string;
				sortOrder: number;
				ingredients: Array<{ description: string }>;
			}>;
			steps: Array<{
				description: string;
				sortOrder: number;
			}>;
		};

		const transformedContent = {
			title: rawContent.title,
			description: rawContent.description?.trim() || undefined,
			servings: rawContent.servings || undefined,
			time: rawContent.time || undefined,
			heroImage: rawContent.heroImage?.trim() || undefined,
			ingredientGroups: rawContent.ingredientGroups.map((group) => ({
				name: group.name?.trim() || undefined,
				sortOrder: group.sortOrder,
				ingredients: group.ingredients
			})),
			steps: rawContent.steps
		};

		// Validate against our Zod schema
		const result = recipeWithDetailsInsertSchema.safeParse(transformedContent);
		if (!result.success) {
			console.error("Zod validation failed:", result.error);
			console.error("Transformed content:", transformedContent);
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "The AI response doesn't match our recipe schema after transformation.",
			});
		}

		return result.data;
	} catch (error) {
		// Handle specific OpenAI errors
		if (error instanceof OpenAI.APIError) {
			console.error("OpenAI API Error:", error);
			
			if (error.status === 401) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Invalid OpenAI API key configuration.",
				});
			} else if (error.status === 429) {
				throw new TRPCError({
					code: "TOO_MANY_REQUESTS",
					message: "OpenAI API rate limit exceeded. Please try again later.",
				});
			} else if (error.status === 400) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid image format or size. Please ensure the image is clear and in a supported format.",
				});
			}
			
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: `OpenAI API error: ${error.message}`,
			});
		}

		// Re-throw TRPC errors
		if (error instanceof TRPCError) {
			throw error;
		}

		// Handle unexpected errors
		console.error("Unexpected error in parseImageWithAI:", error);
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "An unexpected error occurred during image parsing.",
		});
	}
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
			groupIds.length > 0 ? await db.select().from(ingredients).where(inArray(ingredients.groupId, groupIds)) : [];

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
	getTopRated: protectedProcedure.input(z.object({ limit: z.number().min(1).max(100).default(9) }).nullish()).query(async ({ input }) => {
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
			.leftJoin(ratingsSub, eq(ratingsSub.recipeId, recipes.id))
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
				imageUrl: z.string(), // This would be a base64 string or a URL
			})
		)
		.output(recipeWithDetailsInsertSchema) // Ensure the output matches your schema
		.mutation(async ({ input }) => {
			try {
				const parsedData = await parseImageWithAI(input.imageUrl);

				// Replace Hero Image with imageUrl
				parsedData.heroImage = input.imageUrl;

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
