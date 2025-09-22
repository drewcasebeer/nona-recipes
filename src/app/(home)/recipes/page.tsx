import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient, trpc } from "@/trpc/server";

import { RecipesView, RecipesViewError, RecipesViewLoading } from "@/modules/recipes/ui/views/recipes-view";
import { RecipeListHeader } from "@/modules/recipes/ui/components/recipe-list-header";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SearchParams } from "nuqs";
import { loadSearchParams } from "@/modules/recipes/params";

interface Props {
	searchParams: Promise<SearchParams>;
}

const RecipesPage = async ({ searchParams }: Props) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/sign-in");
	}

	const filters = await loadSearchParams(searchParams);
	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(trpc.recipes.getMany.queryOptions({ ...filters }));

	return (
		<>
			<RecipeListHeader />
			<HydrationBoundary state={dehydrate(queryClient)}>
				<Suspense fallback={<RecipesViewLoading />}>
					<ErrorBoundary fallback={<RecipesViewError />}>
						<RecipesView />
					</ErrorBoundary>
				</Suspense>
			</HydrationBoundary>
		</>
	);
};

export default RecipesPage;
