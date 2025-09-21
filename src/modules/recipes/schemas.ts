import { z } from "zod";

/**
 * -----------------------
 * Base Recipe Schema
 * -----------------------
 */
const recipesBaseSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	servings: z.number().int("Servings must be an integer").min(1, "Servings must be at least 1").optional(),
	time: z
		.number()
		.int("Time must be an integer")
		.min(0, "Time must be 0 or more") // allow 0 minutes (e.g., no-cook recipes)
		.optional(),
	heroImage: z.url("Hero image must be a valid URL").optional(),
});

/**
 * -----------------------
 * Nested Schemas
 * -----------------------
 */
export const ingredientSchema = z.object({
	description: z.string().min(1, "Ingredient description is required"),
});

export const ingredientGroupSchema = z.object({
	name: z.string().optional(),
	sortOrder: z.number().int().nonnegative(), // Remove .default(0)
	ingredients: z.array(ingredientSchema).min(1, "At least one ingredient is required"), // Remove .default([])
});

export const recipeStepSchema = z.object({
	description: z.string().min(1, "Step description is required"),
	sortOrder: z.number().int().nonnegative(), // Remove .default(0)
});

/**
 * -----------------------
 * Public Schemas
 * -----------------------
 */
export const recipesInsertSchema = recipesBaseSchema.strict();

export const recipesUpdateSchema = recipesBaseSchema
	.extend({
		id: z.string().min(1, "ID is required"),
	})
	.strict();

// Composite schema for creating/updating recipes WITH details
export const recipeWithDetailsInsertSchema = recipesBaseSchema
	.extend({
		ingredientGroups: z.array(ingredientGroupSchema).min(1, "At least one ingredient group is required"),
		steps: z.array(recipeStepSchema).min(1, "At least one step is required"),
	})
	.strict();

export const recipeWithDetailsUpdateSchema = recipeWithDetailsInsertSchema
	.extend({
		id: z.string().min(1, "ID is required"),
	})
	.strict();
