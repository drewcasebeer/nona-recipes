// import { agentsRouter } from "@/modules/agents/server/procedures";
// import { meetingsRouter } from "@/modules/meetings/server/procedures";

import { createTRPCRouter } from "../init";
import { recipesRouter } from "@/modules/recipes/server/procedures";

export const appRouter = createTRPCRouter({
	recipes: recipesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
