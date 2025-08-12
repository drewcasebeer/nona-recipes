import { z } from "zod";

export const recipesInsertSchema = z.object({
	title: z.string().min(1, { message: "Title is required" }),
});

export const recipesUpdateSchema = recipesInsertSchema.extend({
	id: z.string().min(1, { message: "ID is required" }),
});
