import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { recipe } from "@/db/schema";
import { db } from "@/db/index";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const recipesRouter = createTRPCRouter({
    getRecipeById: baseProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const rows = await db.select().from(recipe).where(eq(recipe.id, input.id));
            const row = rows[0];
            if (!row) throw new Error("Recipe not found");
            // Parse JSON fields
            return {
                ...row,
                tags: row.tags ? JSON.parse(row.tags) : [],
                ingredients: row.ingredients ? JSON.parse(row.ingredients) : [],
                steps: row.steps ? JSON.parse(row.steps) : []
            };
        }),

    addRecipe: baseProcedure
        .input(z.object({
            title: z.string(),
            description: z.string(),
            image: z.string().optional(),
            time: z.string(),
            rating: z.number().optional(),
            tags: z.array(z.string()).optional(),
            author: z.string(),
            servings: z.number(),
            difficulty: z.enum(["Easy", "Medium", "Hard"]),
            cuisine: z.string().optional(),
            ingredients: z.array(z.object({ item: z.string(), amount: z.string() })),
            steps: z.array(z.string())
        }))
        .mutation(async ({ input }) => {
            const id = crypto.randomUUID();
            await db.insert(recipe).values({
                id,
                title: input.title,
                description: input.description,
                image: input.image ?? "/placeholder.png",
                time: input.time,
                rating: input.rating?.toString() ?? "0",
                tags: JSON.stringify(input.tags ?? []),
                author: input.author,
                servings: input.servings.toString(),
                difficulty: input.difficulty,
                cuisine: input.cuisine ?? "",
                ingredients: JSON.stringify(input.ingredients),
                steps: JSON.stringify(input.steps)
            });
            return { id };
        }),
});
