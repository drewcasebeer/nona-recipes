import { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/trpc/routers/_app";

export type RecipeGetOne = inferRouterOutputs<AppRouter>["recipes"]["getOne"];
export type RecipeGetOneWithDetails = inferRouterOutputs<AppRouter>["recipes"]["getOneWithDetails"];
