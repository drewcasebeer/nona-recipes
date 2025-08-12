import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { recipeRatings, recipes, user } from "@/db/schema";
import { db } from "@/db";
import { z } from "zod";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { recipesInsertSchema, recipesUpdateSchema } from "../schemas";

export const recipesRouter = createTRPCRouter({
	getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
		// Subquery to calculate rating
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
				rating: ratingsSub.rating,
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

			// Subquery to calculate average rating per recipe
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
					rating: ratingsSub.rating,
					author: sql`${user.name}`.as("author"),
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

			const totalPages = Math.ceil(total.count / pageSize);

			return {
				items: data,
				total: total.count,
				totalPages,
			};
		}),
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
	})
});
